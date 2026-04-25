from django.urls import path
from .views import TeamListView, TeamDetailView, TeamTemplateListView, TeamTemplateDetailView, CreateTeamFromTemplateView

urlpatterns = [
    path('', TeamListView.as_view(), name='team-list'),
    path('<int:pk>/', TeamDetailView.as_view(), name='team-detail'),
    path('templates/', TeamTemplateListView.as_view(), name='team-template-list'),
    path('templates/<int:pk>/', TeamTemplateDetailView.as_view(), name='team-template-detail'),
    path('templates/<int:template_id>/create-team/', CreateTeamFromTemplateView.as_view(), name='create-team-from-template'),
]
