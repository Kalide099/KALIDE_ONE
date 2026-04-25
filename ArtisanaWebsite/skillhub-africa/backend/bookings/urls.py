from django.urls import path
from .views import BookingCreateView, BookingUpdateStatusView, AvailabilityListView, AvailabilityDetailView

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking-create'),
    path('<int:pk>/status/', BookingUpdateStatusView.as_view(), name='booking-update-status'),
    path('availability/', AvailabilityListView.as_view(), name='availability-list'),
    path('availability/<int:pk>/', AvailabilityDetailView.as_view(), name='availability-detail'),
]
