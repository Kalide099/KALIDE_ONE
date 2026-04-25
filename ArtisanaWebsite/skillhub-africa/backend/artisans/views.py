from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Professional, SkillCategory, PortfolioItem, ProfessionalVerification, Badge
from .serializers import ProfessionalSerializer, SkillCategorySerializer, PortfolioItemSerializer, ProfessionalVerificationSerializer, BadgeSerializer


class ProfessionalListView(generics.ListAPIView):
    serializer_class = ProfessionalSerializer

    def get_queryset(self):
        queryset = Professional.objects.filter(is_verified=True)
        location = self.request.query_params.get('location')
        rating = self.request.query_params.get('rating')
        experience = self.request.query_params.get('experience')
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')

        if location:
            queryset = queryset.filter(user__city__icontains=location)
        if rating:
            queryset = queryset.filter(rating__gte=rating)
        if experience:
            queryset = queryset.filter(experience_years__gte=experience)
        if price_min:
            queryset = queryset.filter(hourly_rate__gte=price_min)
        if price_max:
            queryset = queryset.filter(hourly_rate__lte=price_max)

        return queryset


class ProfessionalDetailView(generics.RetrieveAPIView):
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer


class PortfolioListView(generics.ListCreateAPIView):
    serializer_class = PortfolioItemSerializer

    def get_queryset(self):
        professional_id = self.kwargs['professional_id']
        return PortfolioItem.objects.filter(professional_id=professional_id)

    def perform_create(self, serializer):
        serializer.save(professional_id=self.kwargs['professional_id'])


class ProfessionalVerificationListView(generics.ListAPIView):
    queryset = ProfessionalVerification.objects.all()
    serializer_class = ProfessionalVerificationSerializer


class AdvancedProfessionalSearchView(APIView):
    """
    Advanced search for Professionals with full-text search and multiple filters
    """
    def get(self, request):
        # Get search parameters
        query = request.GET.get('q', '')  # Full-text search query
        skills = request.GET.getlist('skills', [])
        location = request.GET.get('location', '')
        rating_min = request.GET.get('rating_min', 0)
        experience_min = request.GET.get('experience_min', 0)
        price_min = request.GET.get('price_min', 0)
        price_max = request.GET.get('price_max', 10000)
        verified_only = request.GET.get('verified_only', 'true').lower() == 'true'
        sort_by = request.GET.get('sort_by', 'rating')  # rating, experience, price, relevance
        sort_order = request.GET.get('sort_order', 'desc')  # asc, desc

        # Base queryset
        queryset = Professional.objects.select_related('user')

        # Apply filters
        if verified_only:
            queryset = queryset.filter(is_verified=True)

        if location:
            queryset = queryset.filter(
                Q(user__location__icontains=location) |
                Q(user__city__icontains=location) |
                Q(user__country__icontains=location)
            )

        if rating_min:
            queryset = queryset.filter(rating__gte=float(rating_min))

        if experience_min:
            queryset = queryset.filter(experience_years__gte=int(experience_min))

        queryset = queryset.filter(
            hourly_rate__gte=float(price_min),
            hourly_rate__lte=float(price_max)
        )

        # Skills filtering
        if skills:
            skill_filters = Q()
            for skill in skills:
                skill_filters |= Q(skills__icontains=skill.lower())
            queryset = queryset.filter(skill_filters)

        # Full-text search
        if query:
            search_filters = Q()
            search_filters |= Q(user__name__icontains=query)
            # search_filters |= Q(bio__icontains=query)  # Note: bio is JSONField now, so direct text search needs adjusting depending on Postgres version. Leaving out for now.
            # Search in skills
            for term in query.split():
                search_filters |= Q(skills__icontains=term.lower())
            queryset = queryset.filter(search_filters)

        # Apply sorting
        if sort_by == 'rating':
            queryset = queryset.order_by('-rating' if sort_order == 'desc' else 'rating')
        elif sort_by == 'experience':
            queryset = queryset.order_by('-experience_years' if sort_order == 'desc' else 'experience_years')
        elif sort_by == 'price':
            queryset = queryset.order_by('hourly_rate' if sort_order == 'asc' else '-hourly_rate')
        else:
            queryset = queryset.order_by('-rating')  # Default sorting

        # Paginate results (simple implementation)
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size

        results = queryset[start:end]
        total_count = queryset.count()

        # Serialize results
        serializer = ProfessionalSerializer(results, many=True)

        return Response({
            'results': serializer.data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size,
            'filters_applied': {
                'query': query,
                'skills': skills,
                'location': location,
                'rating_min': rating_min,
                'experience_min': experience_min,
                'price_range': f"{price_min}-{price_max}",
                'verified_only': verified_only,
                'sort_by': sort_by,
                'sort_order': sort_order
            }
        })


class ProfessionalVerificationUpdateView(generics.UpdateAPIView):
    queryset = ProfessionalVerification.objects.all()
    serializer_class = ProfessionalVerificationSerializer
    http_method_names = ['patch']


class BadgeListView(generics.ListCreateAPIView):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer


class BadgeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
