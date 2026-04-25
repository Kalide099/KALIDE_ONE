from rest_framework import serializers
from .models import Booking, Availability


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    client = serializers.StringRelatedField()
    professional = serializers.StringRelatedField()
    team = serializers.StringRelatedField()
    project = serializers.StringRelatedField()

    class Meta:
        model = Booking
        fields = '__all__'
