from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Team, TeamTemplate, TeamMember, TeamRole
from .serializers import TeamSerializer, TeamTemplateSerializer
from artisans.models import Professional
from users.models import User
from projects.models import Project, ProjectTask


class TeamListView(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def get_queryset(self):
        queryset = Team.objects.all().prefetch_related('members__professional')
        if self.request.method == 'GET' and self.request.user.is_authenticated:
            return queryset.filter(created_by=self.request.user)
        return queryset

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        name = str(request.data.get('name', '')).strip()
        description = str(request.data.get('description', '')).strip()

        if not name or not description:
            return Response({'message': 'name and description are required'}, status=status.HTTP_400_BAD_REQUEST)

        category = None
        category_id = request.data.get('category')
        if category_id:
            try:
                category = Team._meta.get_field('category').related_model.objects.get(pk=category_id)
            except Team._meta.get_field('category').related_model.DoesNotExist:
                return Response({'message': 'Invalid category'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            category = Team._meta.get_field('category').related_model.objects.order_by('id').first()

        if not category:
            return Response({'message': 'No team category is configured'}, status=status.HTTP_400_BAD_REQUEST)

        team = Team.objects.create(
            name={'en': name, 'fr': name},
            description={'en': description, 'fr': description},
            category=category,
            created_by=request.user,
        )

        return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)


class TeamDetailView(generics.RetrieveAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer


class TeamMemberListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        team = get_object_or_404(Team, id=team_id)
        email = str(request.data.get('email', '')).strip().lower()
        if not email:
            return Response({'message': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'message': 'User with this email was not found'}, status=status.HTTP_404_NOT_FOUND)

        if TeamMember.objects.filter(team=team, professional=user).exists():
            return Response({'message': 'User is already a member of this team'}, status=status.HTTP_400_BAD_REQUEST)

        member = TeamMember.objects.create(
            team=team,
            professional=user,
            role={
                'base_role': str(request.data.get('base_role', 'member')),
                'permissions': request.data.get('permissions', []) if isinstance(request.data.get('permissions', []), list) else [],
                'skills': request.data.get('skills', []) if isinstance(request.data.get('skills', []), list) else [],
            },
        )

        from .serializers import TeamMemberSerializer
        return Response(TeamMemberSerializer(member).data, status=status.HTTP_201_CREATED)


class TeamMemberDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, team_id, member_id):
        member = get_object_or_404(TeamMember, id=member_id, team_id=team_id)

        current_role = member.role if isinstance(member.role, dict) else {'base_role': str(member.role or 'member')}
        base_role = request.data.get('base_role', current_role.get('base_role', 'member'))
        permissions = request.data.get('permissions', current_role.get('permissions', []))
        skills = request.data.get('skills', current_role.get('skills', []))

        member.role = {
            'base_role': str(base_role),
            'permissions': permissions if isinstance(permissions, list) else [],
            'skills': skills if isinstance(skills, list) else [],
        }
        member.save(update_fields=['role'])

        from .serializers import TeamMemberSerializer
        return Response(TeamMemberSerializer(member).data)

    def delete(self, request, team_id, member_id):
        member = get_object_or_404(TeamMember, id=member_id, team_id=team_id)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamProjectSkillMapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, team_id, project_id):
        tasks = ProjectTask.objects.filter(project_id=project_id, project__team_id=team_id).select_related('professional')
        data = []
        for task in tasks:
            data.append({
                'id': task.id,
                'title': task.title.get('en') if isinstance(task.title, dict) else str(task.title),
                'description': task.description.get('en') if isinstance(task.description, dict) else str(task.description),
                'status': task.status,
                'member': {
                    'id': task.professional_id,
                    'name': task.professional.name,
                    'email': task.professional.email,
                },
            })
        return Response(data)

    def post(self, request, team_id, project_id):
        project = get_object_or_404(Project, id=project_id, team_id=team_id)
        member_id = request.data.get('member_id')
        required_skill = str(request.data.get('required_skill', '')).strip()

        if not member_id or not required_skill:
            return Response({'message': 'member_id and required_skill are required'}, status=status.HTTP_400_BAD_REQUEST)

        team_member = get_object_or_404(TeamMember, id=member_id, team_id=team_id)
        title = str(request.data.get('task_title', '')).strip() or f"{required_skill.title()} Task"
        description_text = str(request.data.get('task_description', '')).strip()

        task = ProjectTask.objects.create(
            project=project,
            professional=team_member.professional,
            title={'en': title, 'fr': title},
            description={'en': description_text, 'fr': description_text, 'required_skill': required_skill},
            status='pending',
        )

        return Response({
            'id': task.id,
            'title': title,
            'description': description_text,
            'required_skill': required_skill,
            'status': task.status,
            'member': {
                'id': team_member.professional_id,
                'name': team_member.professional.name,
                'email': team_member.professional.email,
            },
        }, status=status.HTTP_201_CREATED)


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
