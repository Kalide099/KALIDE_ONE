from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Project, Milestone, ProjectUpdate
from .serializers import ProjectSerializer, MilestoneSerializer, ProjectUpdateSerializer


class ProjectListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(Q(client=user) | Q(professional=user))


class ProjectCreateView(generics.CreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReleaseEscrowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, client=request.user)
            if project.escrow_released:
                return Response({"message": "Escrow already released"}, status=status.HTTP_400_BAD_REQUEST)
            
            project.escrow_released = True
            project.status = 'completed'
            project.save()
            return Response({"message": "Escrow released successfully", "status": "completed"})
        except Project.DoesNotExist:
            return Response({"message": "Project not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)


class MilestoneListCreateView(generics.ListCreateAPIView):
    serializer_class = MilestoneSerializer

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Milestone.objects.filter(project_id=project_id)

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs['project_id'])


class MilestoneDetailView(generics.RetrieveUpdateAPIView):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer


class ProjectUpdateListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectUpdateSerializer

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return ProjectUpdate.objects.filter(project_id=project_id)

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs['project_id'])
