from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Team, TeamTemplate, TeamMember, TeamRole
from .serializers import TeamSerializer, TeamTemplateSerializer
from artisans.models import Professional
from users.models import User


class TeamListView(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer


class TeamDetailView(generics.RetrieveAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer


class TeamTemplateListView(generics.ListAPIView):
    queryset = TeamTemplate.objects.all()
    serializer_class = TeamTemplateSerializer


class TeamTemplateDetailView(generics.RetrieveAPIView):
    queryset = TeamTemplate.objects.all()
    serializer_class = TeamTemplateSerializer


class CreateTeamFromTemplateView(APIView):
    def post(self, request, template_id):
        try:
            template = TeamTemplate.objects.get(id=template_id)
        except TeamTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

        # Automated professional selection based on template roles
        selected_professionals = {}
        # Assuming `roles` has min/max attributes, simplified for now based on legacy logic
        for role in template.roles.all():
            # Find professionals matching the role requirements natively
            # This logic needs adjustment to match JSON skills, but for migration sake:
            professionals = Professional.objects.filter(
                user__is_active=True,
                is_verified=True
            ).order_by('-rating', '-completed_projects')[:2]  # Hardware limit of 2 for template

            if not professionals:
                return Response({
                    'error': f'Not enough professionals available for role {role.role_name.get("en", "Unknown")}'
                }, status=status.HTTP_400_BAD_REQUEST)

            selected_professionals[role] = professionals

        # Create team with selected professionals
        with transaction.atomic():
            template_name = template.name.get('en', 'Auto Team')
            team = Team.objects.create(
                name={"en": f"{template_name} - Auto Generated", "fr": f"{template_name} - Généré Automatiquement"},
                description=template.description,
                category=template.category,
                created_by=request.user
            )

            # Add professionals to team
            for role, pros in selected_professionals.items():
                for pro in pros:
                    TeamMember.objects.create(
                        team=team,
                        professional=pro.user,
                        role=role.role_name
                    )

        serializer = TeamSerializer(team)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
