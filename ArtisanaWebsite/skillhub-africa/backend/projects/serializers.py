from rest_framework import serializers
from .models import Project, ProjectTask, Milestone, ProjectUpdate


class ProjectTaskSerializer(serializers.ModelSerializer):
    professional = serializers.StringRelatedField()

    class Meta:
        model = ProjectTask
        fields = '__all__'


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'


class ProjectUpdateSerializer(serializers.ModelSerializer):
    professional = serializers.StringRelatedField()

    class Meta:
        model = ProjectUpdate
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    tasks = ProjectTaskSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)
    updates = ProjectUpdateSerializer(many=True, read_only=True)
    client = serializers.StringRelatedField()
    team = serializers.StringRelatedField()
    professional = serializers.StringRelatedField()
    client_id = serializers.IntegerField(source='client.id', read_only=True)
    team_id = serializers.IntegerField(source='team.id', read_only=True)
    professional_id = serializers.IntegerField(source='professional.id', read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
