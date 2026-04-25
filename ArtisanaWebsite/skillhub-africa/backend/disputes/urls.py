from django.urls import path
from . import views

app_name = 'disputes'

urlpatterns = [
    # Dispute management
    path('', views.DisputeListView.as_view(), name='dispute-list'),
    path('<int:pk>/', views.DisputeDetailView.as_view(), name='dispute-detail'),

    # Dispute messages
    path('<int:dispute_id>/messages/', views.DisputeMessageListView.as_view(), name='dispute-messages'),

    # Dispute evidence
    path('<int:dispute_id>/evidence/', views.DisputeEvidenceListView.as_view(), name='dispute-evidence'),

    # Admin dispute resolution
    path('<int:dispute_id>/resolve/', views.AdminDisputeResolutionView.as_view(), name='dispute-resolve'),
]
