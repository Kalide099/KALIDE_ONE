from artisans.models import Professional
from bundles.models import Team
from services.models import Service
from reviews.models import Review
from bookings.models import Booking
import random


class ArtisanRecommendationService:
    """
    Service for generating artisan recommendations based on various factors
    """

    def get_recommendations_for_artisan(self, professional_id):
        """
        Get personalized recommendations for similar artisans
        """
        try:
            artisan = Professional.objects.get(id=professional_id)

            # Find artisans with similar skills
            similar_artisans = Professional.objects.filter(
                is_verified=True
            ).exclude(id=professional_id)

            recommendations = []

            for similar_artisan in similar_artisans[:10]:  # Limit to 10 recommendations
                # Calculate similarity score based on skills overlap (assuming skills is a JSON list now)
                
                artisan_skills = set(artisan.skills) if isinstance(artisan.skills, list) else set()
                similar_skills = set(similar_artisan.skills) if isinstance(similar_artisan.skills, list) else set()
                skill_overlap = len(artisan_skills.intersection(similar_skills))

                # Calculate score based on multiple factors
                score = (
                    skill_overlap * 0.4 +  # Skills overlap (40%)
                    float(similar_artisan.rating / 5.0) * 0.3 +  # Rating (30%)
                    min(similar_artisan.experience_years / 10.0, 1.0) * 0.2 +  # Experience (20%)
                    (1.0 if similar_artisan.is_verified else 0.0) * 0.1  # Verification (10%)
                )

                recommendations.append({
                    'professional_id': similar_artisan.id,
                    'professional_name': similar_artisan.user.name,
                    'rating': float(similar_artisan.rating),
                    'skills': similar_artisan.skills,
                    'hourly_rate': float(similar_artisan.hourly_rate),
                    'similarity_score': round(score, 2),
                    'reason': f"Similar skills: {skill_overlap} matches"
                })

            # Sort by similarity score
            recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)

            return recommendations[:5]  # Return top 5

        except Professional.DoesNotExist:
            return []
        except Exception as e:
            print(f"Error getting professional recommendations: {str(e)}")
            return []


class BundlesRecommendationService:
    """
    Service for generating team bundle recommendations
    """

    def get_recommendations_for_bundle(self, team_id):
        """
        Get personalized Team recommendations
        """
        try:
            team = Team.objects.get(id=team_id)

            # Find similar teams based on project synergies
            similar_teams = Team.objects.all().exclude(id=team_id)[:10]

            recommendations = []

            for similar_team in similar_teams:
                # Calculate similarity score
                score = random.uniform(0.5, 0.9)  # Simplified scoring

                recommendations.append({
                    'team_id': similar_team.id,
                    'team_name': similar_team.name,
                    'price': float(similar_team.price),
                    'rating': float(similar_team.rating),
                    'similarity_score': round(score, 2),
                    'reason': f"AI Synergy Match Identified"
                })

            # Sort by similarity score
            recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)

            return recommendations[:5]  # Return top 5

        except Team.DoesNotExist:
            return []
        except Exception as e:
            print(f"Error getting team recommendations: {str(e)}")
            return []
