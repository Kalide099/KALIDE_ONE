from rest_framework import serializers
from .models import Team, TeamMember, TeamTemplate, TeamRole

class TeamMemberSerializer(serializers.ModelSerializer):
    professional = serializers.StringRelatedField()

    class Meta:
        model = TeamMember
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField()
    category = serializers.StringRelatedField()

    class Meta:
        model = Team
        fields = '__all__'

class TeamRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamRole
        fields = '__all__'

class TeamTemplateSerializer(serializers.ModelSerializer):
    roles = TeamRoleSerializer(many=True, read_only=True)
    category = serializers.StringRelatedField()

    class Meta:
        model = TeamTemplate
        fields = '__all__'
