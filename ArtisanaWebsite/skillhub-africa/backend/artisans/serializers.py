# Serializers for the professionals (formerly artisans) app
from rest_framework import serializers
from .models import Professional, SkillCategory, ProfessionalVerification, PortfolioItem, Badge

class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = '__all__'

class ProfessionalSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Professional
        fields = '__all__'

class ProfessionalVerificationSerializer(serializers.ModelSerializer):
    professional = serializers.StringRelatedField()

    class Meta:
        model = ProfessionalVerification
        fields = '__all__'

class PortfolioItemSerializer(serializers.ModelSerializer):
    professional = serializers.StringRelatedField()

    class Meta:
        model = PortfolioItem
        fields = '__all__'

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'
