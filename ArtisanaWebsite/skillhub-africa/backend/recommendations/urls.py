from django.urls import path
from . import views

urlpatterns = [
    path('artisan/<int:artisan_id>/', views.ArtisanRecommendationsView.as_view(), name='artisan-recommendations'),
    path('bundle/<int:team_id>/', views.BundleRecommendationsView.as_view(), name='bundle-recommendations'),
]
