from rest_framework import serializers
from .models import Dispute, DisputeMessage, DisputeEvidence


class DisputeEvidenceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)

    class Meta:
        model = DisputeEvidence
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_at', 'uploaded_by']


class DisputeMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)

    class Meta:
        model = DisputeMessage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'sender']


class DisputeSerializer(serializers.ModelSerializer):
    initiator_name = serializers.CharField(source='initiator.name', read_only=True)
    respondent_name = serializers.CharField(source='respondent.name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.name', read_only=True)
    messages = DisputeMessageSerializer(many=True, read_only=True)
    evidence = DisputeEvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = Dispute
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'resolved_at']


class DisputeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = ['project', 'respondent', 'title', 'description', 'evidence', 'priority']
        read_only_fields = ['initiator', 'status']

    def create(self, validated_data):
        validated_data['initiator'] = self.context['request'].user
        return super().create(validated_data)


class DisputeResolutionSerializer(serializers.Serializer):
    resolution = serializers.ChoiceField(choices=Dispute.RESOLUTION_CHOICES)
    resolution_notes = serializers.CharField(required=False)

    def update(self, instance, validated_data):
        instance.resolve(
            resolution=validated_data['resolution'],
            resolution_notes=validated_data.get('resolution_notes', ''),
            resolved_by=self.context['request'].user
        )
        return instance
