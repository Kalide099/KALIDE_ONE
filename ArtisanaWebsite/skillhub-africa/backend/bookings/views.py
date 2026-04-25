from rest_framework import generics, status
from rest_framework.response import Response
from .models import Booking, Availability
from .serializers import BookingSerializer, AvailabilitySerializer


class AvailabilityListView(generics.ListCreateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer


class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer


class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer


class BookingUpdateStatusView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    http_method_names = ['patch']

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = request.data.get('status', instance.status)
        instance.save()
        
        # Free up availability if cancelled
        if instance.status == 'cancelled' and instance.scheduled_date:
            availabilities = Availability.objects.filter(
                professional=instance.professional,
                date=instance.scheduled_date,
                start_time=instance.start_time
            )
            for av in availabilities:
                av.is_booked = False
                av.save()
                
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
