from django.urls import path
from .views import (
    TeamListView,
    TeamDetailView,
    TeamTemplateListView,
    TeamTemplateDetailView,
    CreateTeamFromTemplateView,
    TeamMemberListCreateView,
    TeamMemberDetailView,
    TeamProjectSkillMapView,
)

urlpatterns = [
    path('', TeamListView.as_view(), name='team-list'),
    path('<int:pk>/', TeamDetailView.as_view(), name='team-detail'),
    path('<int:team_id>/members/', TeamMemberListCreateView.as_view(), name='team-member-list-create'),
    path('<int:team_id>/members/<int:member_id>/', TeamMemberDetailView.as_view(), name='team-member-detail'),
    path('<int:team_id>/projects/<int:project_id>/skills-map/', TeamProjectSkillMapView.as_view(), name='team-project-skills-map'),
    path('templates/', TeamTemplateListView.as_view(), name='team-template-list'),
    path('templates/<int:pk>/', TeamTemplateDetailView.as_view(), name='team-template-detail'),
    path('templates/<int:template_id>/create-team/', CreateTeamFromTemplateView.as_view(), name='create-team-from-template'),
]
