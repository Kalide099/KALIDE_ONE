from django.urls import path
from . import views

urlpatterns = [
    path('alerts/', views.FraudAlertListView.as_view(), name='fraud-alerts'),
    path('scan/', views.FraudDetectionScanView.as_view(), name='fraud-scan'),
]
