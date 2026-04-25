from django.db import models
from django.urls import path
from .views import (
    ProfessionalListView, ProfessionalDetailView, PortfolioListView, 
    ProfessionalVerificationListView, ProfessionalVerificationUpdateView, 
    AdvancedProfessionalSearchView, BadgeListView, BadgeDetailView
)

urlpatterns = [
    path('', ProfessionalListView.as_view(), name='professional-list'),
    path('<int:pk>/', ProfessionalDetailView.as_view(), name='professional-detail'),
    path('<int:professional_id>/portfolio/', PortfolioListView.as_view(), name='portfolio-list'),
    path('verifications/', ProfessionalVerificationListView.as_view(), name='verification-list'),
    path('verifications/<int:pk>/', ProfessionalVerificationUpdateView.as_view(), name='verification-update'),
    path('search/', AdvancedProfessionalSearchView.as_view(), name='advanced-professional-search'),
    path('badges/', BadgeListView.as_view(), name='badge-list'),
    path('badges/<int:pk>/', BadgeDetailView.as_view(), name='badge-detail'),
]
