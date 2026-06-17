from rest_framework import generics
from .models import Review
from .serializers import ReviewSerializer


class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        queryset = Review.objects.all()
        worker_id = self.request.query_params.get('worker_id', None)
        if worker_id is not None:
            queryset = queryset.filter(reviewee__id=worker_id)
        return queryset
