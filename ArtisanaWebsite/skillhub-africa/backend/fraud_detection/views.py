from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FraudAlert
from .serializers import FraudAlertSerializer
from .services import FraudDetectionService


class FraudAlertListView(generics.ListCreateAPIView):
    queryset = FraudAlert.objects.all().order_by('-created_at')
    serializer_class = FraudAlertSerializer

    def get_queryset(self):
        queryset = FraudAlert.objects.all().order_by('-created_at')

        # Filter by severity
        severity = self.request.GET.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)

        # Filter by status
        status_filter = self.request.GET.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset


class FraudDetectionScanView(APIView):
    """
    Trigger fraud detection scan
    """

    def post(self, request):
        try:
            service = FraudDetectionService()
            alerts_created = service.run_full_scan()

            return Response({
                'message': f'Fraud detection scan completed successfully',
                'alerts_created': alerts_created
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Fraud detection scan failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
