from django.urls import path
from .views import (
    ProjectListView, ProjectCreateView, ProjectDetailView, 
    ReleaseEscrowView,
    MilestoneListCreateView, MilestoneDetailView, 
    ProjectUpdateListCreateView
)

urlpatterns = [
    path('', ProjectListView.as_view(), name='project-list'),
    path('create/', ProjectCreateView.as_view(), name='project-create'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<int:pk>/release-escrow/', ReleaseEscrowView.as_view(), name='release-escrow'),
    path('<int:project_id>/milestones/', MilestoneListCreateView.as_view(), name='milestone-list'),
    path('milestones/<int:pk>/', MilestoneDetailView.as_view(), name='milestone-detail'),
    path('<int:project_id>/updates/', ProjectUpdateListCreateView.as_view(), name='project-update-list'),
]
