from rest_framework import serializers
from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    professional = serializers.StringRelatedField()
    category = serializers.StringRelatedField()

    class Meta:
        model = Service
        fields = '__all__'
