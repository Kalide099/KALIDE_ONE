from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
    path('revenue/', views.RevenueAnalyticsView.as_view(), name='revenue-analytics'),
    path('users/', views.UserAnalyticsView.as_view(), name='user-analytics'),
    path('artisans/', views.ArtisanAnalyticsView.as_view(), name='artisan-analytics'),
    path('bookings/', views.BookingAnalyticsView.as_view(), name='booking-analytics'),
    path('performance/', views.PerformanceAnalyticsView.as_view(), name='performance-analytics'),
]
