from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import models
from rest_framework import serializers
from .models import Dispute, DisputeMessage, DisputeEvidence
from .serializers import (
    DisputeSerializer, DisputeCreateSerializer,
    DisputeMessageSerializer, DisputeEvidenceSerializer,
    DisputeResolutionSerializer
)


class DisputeListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DisputeSerializer

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DisputeCreateSerializer
        return DisputeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Dispute.objects.all()
        return Dispute.objects.filter(
            models.Q(initiator=user) | models.Q(respondent=user)
        )

    def perform_create(self, serializer):
        serializer.save()


class DisputeDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DisputeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Dispute.objects.all()
        return Dispute.objects.filter(
            models.Q(initiator=user) | models.Q(respondent=user)
        )


class DisputeMessageListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DisputeMessageSerializer

    def get_queryset(self):
        dispute_id = self.kwargs['dispute_id']
        dispute = get_object_or_404(Dispute, id=dispute_id)

        # Check if user is involved in the dispute or is admin
        user = self.request.user
        if not (user.is_staff or dispute.initiator == user or dispute.respondent == user):
            return DisputeMessage.objects.none()

        return DisputeMessage.objects.filter(dispute=dispute)

    def perform_create(self, serializer):
        dispute_id = self.kwargs['dispute_id']
        dispute = get_object_or_404(Dispute, id=dispute_id)

        # Check if user is involved in the dispute or is admin
        user = self.request.user
        if not (user.is_staff or dispute.initiator == user or dispute.respondent == user):
            raise serializers.ValidationError("You are not authorized to send messages in this dispute.")

        serializer.save(dispute=dispute, sender=user)


class DisputeEvidenceListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DisputeEvidenceSerializer

    def get_queryset(self):
        dispute_id = self.kwargs['dispute_id']
        dispute = get_object_or_404(Dispute, id=dispute_id)

        # Check if user is involved in the dispute or is admin
        user = self.request.user
        if not (user.is_staff or dispute.initiator == user or dispute.respondent == user):
            return DisputeEvidence.objects.none()

        return DisputeEvidence.objects.filter(dispute=dispute)

    def perform_create(self, serializer):
        dispute_id = self.kwargs['dispute_id']
        dispute = get_object_or_404(Dispute, id=dispute_id)

        # Check if user is involved in the dispute or is admin
        user = self.request.user
        if not (user.is_staff or dispute.initiator == user or dispute.respondent == user):
            raise serializers.ValidationError("You are not authorized to upload evidence for this dispute.")

        serializer.save(dispute=dispute, uploaded_by=user)


class AdminDisputeResolutionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, dispute_id):
        if not request.user.is_staff:
            return Response(
                {"error": "Only administrators can resolve disputes."},
                status=status.HTTP_403_FORBIDDEN
            )

        dispute = get_object_or_404(Dispute, id=dispute_id)

        if dispute.status == 'resolved':
            return Response(
                {"error": "This dispute has already been resolved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DisputeResolutionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(dispute, serializer.validated_data)
            return Response({
                "message": "Dispute resolved successfully.",
                "dispute": DisputeSerializer(dispute).data
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
