from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import ArtisanRecommendationService, BundlesRecommendationService


class ArtisanRecommendationsView(APIView):
    """
    Get personalized artisan recommendations for a user
    """

    def get(self, request, artisan_id):
        try:
            service = ArtisanRecommendationService()
            recommendations = service.get_recommendations_for_artisan(artisan_id)

            return Response({
                'artisan_id': artisan_id,
                'recommendations': recommendations
            })

        except Exception as e:
            return Response({
                'error': f'Failed to get artisan recommendations: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BundleRecommendationsView(APIView):
    """
    Get personalized bundle recommendations for a user
    """

    def get(self, request, team_id):
        try:
            service = BundlesRecommendationService()
            recommendations = service.get_recommendations_for_bundle(team_id)

            return Response({
                'team_id': team_id,
                'recommendations': recommendations
            })

        except Exception as e:
            return Response({
                'error': f'Failed to get bundle recommendations: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
