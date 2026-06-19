from rest_framework import serializers
from .models import Team, TeamMember, TeamTemplate, TeamRole


def _get_translated_text(value, fallback=''):
    if isinstance(value, dict):
        return value.get('en') or value.get('fr') or next(iter(value.values()), fallback)
    if isinstance(value, str):
        return value
    return fallback


def _extract_member_role_data(role_value):
    if isinstance(role_value, dict):
        base_role = role_value.get('base_role')
        permissions = role_value.get('permissions')
        skills = role_value.get('skills')

        if base_role is None:
            base_role = _get_translated_text(role_value, 'member')

        return {
            'base_role': str(base_role or 'member'),
            'permissions': permissions if isinstance(permissions, list) else [],
            'skills': skills if isinstance(skills, list) else [],
        }

    return {
        'base_role': str(role_value or 'member'),
        'permissions': [],
        'skills': [],
    }

class TeamMemberSerializer(serializers.ModelSerializer):
    base_role = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = ['id', 'team', 'professional', 'base_role', 'permissions', 'skills', 'user']

    def get_base_role(self, obj):
        return _extract_member_role_data(obj.role)['base_role']

    def get_permissions(self, obj):
        return _extract_member_role_data(obj.role)['permissions']

    def get_skills(self, obj):
        return _extract_member_role_data(obj.role)['skills']

    def get_user(self, obj):
        user = obj.professional
        return {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'city': user.city,
            'country': user.country,
        }

class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(read_only=True)
    members_count = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'category', 'created_by', 'members', 'members_count']

    def get_members_count(self, obj):
        return obj.members.count()

    def get_name(self, obj):
        return _get_translated_text(obj.name, 'Team')

    def get_description(self, obj):
        return _get_translated_text(obj.description, '')

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
