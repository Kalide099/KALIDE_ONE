from .models import FraudAlert
from bookings.models import Booking
from reviews.models import Review
from payments.models import Payment
from django.utils import timezone
from django.db.models import Count, Q
import logging

logger = logging.getLogger(__name__)


class FraudDetectionService:
    """
    Service for detecting fraudulent activities on the platform
    """

    def run_full_scan(self):
        """
        Run a comprehensive fraud detection scan
        """
        alerts_created = 0

        # Run different fraud detection checks
        alerts_created += self._detect_fake_reviews()
        alerts_created += self._detect_booking_cancellations()
        alerts_created += self._detect_payment_anomalies()
        alerts_created += self._detect_suspicious_user_behavior()

        return alerts_created

    def _detect_fake_reviews(self):
        """
        Detect potentially fake reviews
        """
        alerts_created = 0

        # Find users who post many reviews with same rating
        suspicious_reviewers = Review.objects.values('user').annotate(
            review_count=Count('id'),
            same_rating_count=Count('id', filter=Q(rating=5))  # All 5-star reviews
        ).filter(
            review_count__gte=10,
            same_rating_count__gte=8  # 80% are 5-star
        )

        for reviewer in suspicious_reviewers:
            user_id = reviewer['user']
            FraudAlert.objects.create(
                reason=f"User posted {reviewer['same_rating_count']} identical 5-star reviews out of {reviewer['review_count']} total",
                severity='medium',
                details=f"User ID: {user_id}. Potential fake review activity detected.",
                user_id=user_id
            )
            alerts_created += 1

        return alerts_created

    def _detect_booking_cancellations(self):
        """
        Detect suspicious booking cancellation patterns
        """
        alerts_created = 0

        # Find users with high cancellation rates
        suspicious_cancelers = Booking.objects.values('client').annotate(
            total_bookings=Count('id'),
            cancelled_bookings=Count('id', filter=Q(status='cancelled'))
        ).filter(
            total_bookings__gte=5,
            cancelled_bookings__gte=4  # 80% cancellation rate
        )

        for canceler in suspicious_cancelers:
            user_id = canceler['client']
            cancel_rate = (canceler['cancelled_bookings'] / canceler['total_bookings']) * 100

            FraudAlert.objects.create(
                reason=f"High booking cancellation rate: {cancel_rate:.1f}% ({canceler['cancelled_bookings']}/{canceler['total_bookings']})",
                severity='high',
                details=f"User ID: {user_id}. Suspicious cancellation pattern detected.",
                user_id=user_id
            )
            alerts_created += 1

        return alerts_created

    def _detect_payment_anomalies(self):
        """
        Detect payment-related anomalies
        """
        alerts_created = 0

        # Find payments with unusual amounts
        suspicious_payments = Payment.objects.filter(
            amount__gt=10000,  # Very high payments
            status='pending'
        )

        for payment in suspicious_payments:
            FraudAlert.objects.create(
                reason=f"Unusually high payment amount: ${payment.amount}",
                severity='medium',
                details=f"Payment ID: {payment.id}, Project: {payment.project.title}",
                user=payment.project.client,
                related_booking_id=payment.project.id
            )
            alerts_created += 1

        return alerts_created

    def _detect_suspicious_user_behavior(self):
        """
        Detect other suspicious user behaviors
        """
        alerts_created = 0

        # Find users who registered recently but have many activities
        recent_users = Review.objects.filter(
            user__date_joined__gte=timezone.now() - timezone.timedelta(days=7)
        ).values('user').annotate(
            activity_count=Count('id')
        ).filter(activity_count__gte=20)  # Many activities in first week

        for user_activity in recent_users:
            user_id = user_activity['user']
            FraudAlert.objects.create(
                reason=f"New user with high activity: {user_activity['activity_count']} actions in first week",
                severity='low',
                details=f"User ID: {user_id}. Monitor for potential bot activity.",
                user_id=user_id
            )
            alerts_created += 1

        return alerts_created
