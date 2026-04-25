from django.urls import path
from .views import NotificationListView, NotificationUpdateView

urlpatterns = [
    path('<int:user_id>/', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', NotificationUpdateView.as_view(), name='notification-update'),
]
