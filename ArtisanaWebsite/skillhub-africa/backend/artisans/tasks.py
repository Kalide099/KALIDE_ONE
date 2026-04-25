from celery import shared_task
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
from .models import ArtisanProfile
from .services import ArtisanRecommendationService
from ..fraud_detection.services import FraudDetectionService
import logging

logger = logging.getLogger(__name__)


@shared_task
def update_Artisan_recommendations_cache():
    """
    Background task to update cached Artisan recommendations
    """
    try:
        # Clear existing cache
        cache.delete_pattern('Artisan_recommendations_*')

        # Get all Artisans and update their recommendation scores
        Artisans = ArtisanProfile.objects.filter(verified=True)
        for Artisan in Artisans:
            recommendations = ArtisanRecommendationService.get_recommendations_for_Artisan(Artisan.id)
            cache_key = f'Artisan_recommendations_{Artisan.id}'
            cache.set(cache_key, recommendations, timeout=3600)  # Cache for 1 hour

        logger.info(f"Updated recommendations cache for {Artisans.count()} Artisans")
        return f"Updated {Artisans.count()} Artisan recommendations"

    except Exception as e:
        logger.error(f"Error updating Artisan recommendations cache: {str(e)}")
        raise


@shared_task
def run_fraud_detection_scan():
    """
    Background task to run fraud detection scans
    """
    try:
        service = FraudDetectionService()
        alerts_created = service.run_full_scan()

        logger.info(f"Fraud detection scan completed. Created {alerts_created} alerts")
        return f"Created {alerts_created} fraud alerts"

    except Exception as e:
        logger.error(f"Error running fraud detection scan: {str(e)}")
        raise


@shared_task
def send_Artisan_verification_reminder():
    """
    Background task to send verification reminders to unverified Artisans
    """
    try:
        unverified_Artisans = ArtisanProfile.objects.filter(verified=False)

        emails_sent = 0
        for Artisan in unverified_Artisans:
            try:
                send_mail(
                    'Complete Your Artisan Verification',
                    f'Hi {Artisan.user.name},\n\n'
                    'Please complete your Artisan verification to start receiving projects.\n\n'
                    'Visit your profile to upload required documents.\n\n'
                    'Best regards,\nSkillHub Africa Team',
                    settings.DEFAULT_FROM_EMAIL,
                    [Artisan.user.email],
                    fail_silently=False,
                )
                emails_sent += 1
            except Exception as e:
                logger.error(f"Failed to send verification reminder to {Artisan.user.email}: {str(e)}")

        logger.info(f"Sent verification reminders to {emails_sent} Artisans")
        return f"Sent {emails_sent} verification reminders"

    except Exception as e:
        logger.error(f"Error sending verification reminders: {str(e)}")
        raise


@shared_task
def update_Artisan_statistics():
    """
    Background task to update Artisan statistics and rankings
    """
    try:
        Artisans = ArtisanProfile.objects.all()

        for Artisan in Artisans:
            # Update completion rate
            total_projects = Artisan.completed_projects
            if total_projects > 0:
                completed_reviews = Artisan.reviews_received.filter(rating__gte=4).count()
                completion_rate = (completed_reviews / total_projects) * 100
                Artisan.completion_rate = completion_rate
                Artisan.save()

        logger.info(f"Updated statistics for {Artisans.count()} Artisans")
        return f"Updated statistics for {Artisans.count()} Artisans"

    except Exception as e:
        logger.error(f"Error updating Artisan statistics: {str(e)}")
        raise
