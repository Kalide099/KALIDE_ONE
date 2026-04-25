from django.urls import path
from .views import (
    RegisterView, LoginView, AdminUserListView, AdminProjectListView, 
    AdminPaymentListView, AnalyticsView, AdminUserDetailView, AdminWarnUserView, 
    AdminToggleAccessView, AdminSubscriptionUpgradeView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:pk>/warn/', AdminWarnUserView.as_view(), name='admin-user-warn'),
    path('admin/users/<int:pk>/toggle-access/', AdminToggleAccessView.as_view(), name='admin-user-toggle-access'),
    path('admin/users/<int:pk>/subscription/', AdminSubscriptionUpgradeView.as_view(), name='admin-user-subscription'),
    path('admin/projects/', AdminProjectListView.as_view(), name='admin-projects'),
    path('admin/payments/', AdminPaymentListView.as_view(), name='admin-payments'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]
