"""
URL configuration for kalide-one project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/kalide-one/', include([
        path('auth/', include('users.urls')),
        path('professionals/', include('artisans.urls')),
        path('services/', include('services.urls')),
        path('teams/', include('bundles.urls')),
        path('projects/', include('projects.urls')),
        path('bookings/', include('bookings.urls')),
        path('reviews/', include('reviews.urls')),
        path('messages/', include('messaging.urls')),
        path('payments/', include('payments.urls')),
        path('notifications/', include('notifications.urls')),
        path('recommendations/', include('recommendations.urls')),
        path('fraud/', include('fraud_detection.urls')),
        path('analytics/', include('analytics_app.urls')),
        path('disputes/', include('disputes.urls')),
    ])),
]
