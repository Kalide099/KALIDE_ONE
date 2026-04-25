from django.core.mail import send_mail
from django.conf import settings
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from .models import Notification
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service for handling email and SMS notifications
    """

    @staticmethod
    def send_email_notification(recipient_email, subject, message, user=None):
        """
        Send email notification
        """
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )

            # Create notification record
            if user:
                Notification.objects.create(
                    user=user,
                    notification_type='email',
                    title=subject,
                    message=message,
                    sent=True
                )

            logger.info(f"Email sent successfully to {recipient_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {recipient_email}: {str(e)}")

            # Create notification record for failed email
            if user:
                Notification.objects.create(
                    user=user,
                    notification_type='email',
                    title=subject,
                    message=message,
                    sent=False
                )

            return False

    @staticmethod
    def send_sms_notification(phone_number, message, user=None):
        """
        Send SMS notification using Twilio
        """
        try:
            if not all([
                settings.TWILIO_ACCOUNT_SID,
                settings.TWILIO_AUTH_TOKEN,
                settings.TWILIO_PHONE_NUMBER
            ]):
                logger.warning("Twilio credentials not configured, skipping SMS")
                return False

            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

            # Format phone number (add + if not present)
            if not phone_number.startswith('+'):
                phone_number = f'+{phone_number}'

            message = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone_number
            )

            # Create notification record
            if user:
                Notification.objects.create(
                    user=user,
                    notification_type='sms',
                    title='SMS Notification',
                    message=message.body,
                    sent=True
                )

            logger.info(f"SMS sent successfully to {phone_number}")
            return True

        except TwilioException as e:
            logger.error(f"Twilio error sending SMS to {phone_number}: {str(e)}")

            # Create notification record for failed SMS
            if user:
                Notification.objects.create(
                    user=user,
                    notification_type='sms',
                    title='SMS Notification',
                    message=message,
                    sent=False
                )

            return False

        except Exception as e:
            logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")

            # Create notification record for failed SMS
            if user:
                Notification.objects.create(
                    user=user,
                    notification_type='sms',
                    title='SMS Notification',
                    message=message,
                    sent=False
                )

            return False

    @staticmethod
    def send_booking_confirmation_notification(booking):
        """
        Send booking confirmation notifications
        """
        client = booking.client
        artisan = booking.artisan

        # Email to client
        client_subject = f"Booking Confirmed - {booking.service.title}"
        client_message = f"""
        Hi {client.name},

        Your booking has been confirmed!

        Service: {booking.service.title}
        Artisan: {artisan.user.name}
        Date: {booking.scheduled_date}
        Time: {booking.scheduled_time}
        Amount: ${booking.total_amount}

        You will receive updates as the work progresses.

        Best regards,
        SkillHub Africa Team
        """

        NotificationService.send_email_notification(
            client.email, client_subject, client_message, client
        )

        # SMS to client
        client_sms = f"Your booking for {booking.service.title} with {artisan.user.name} is confirmed. Date: {booking.scheduled_date}"
        if client.phone:
            NotificationService.send_sms_notification(client.phone, client_sms, client)

        # Email to artisan
        artisan_subject = f"New Booking - {booking.service.title}"
        artisan_message = f"""
        Hi {artisan.user.name},

        You have a new booking!

        Service: {booking.service.title}
        Client: {client.name}
        Date: {booking.scheduled_date}
        Time: {booking.scheduled_time}
        Amount: ${booking.total_amount}

        Please prepare for the work and contact the client if needed.

        Best regards,
        SkillHub Africa Team
        """

        NotificationService.send_email_notification(
            artisan.user.email, artisan_subject, artisan_message, artisan.user
        )

        # SMS to artisan
        artisan_sms = f"New booking: {booking.service.title} with {client.name} on {booking.scheduled_date}"
        if artisan.user.phone:
            NotificationService.send_sms_notification(artisan.user.phone, artisan_sms, artisan.user)

    @staticmethod
    def send_payment_notification(payment):
        """
        Send payment notifications
        """
        user = payment.booking.client

        subject = f"Payment {'Received' if payment.status == 'completed' else 'Failed'} - SkillHub Africa"
        message = f"""
        Hi {user.name},

        Your payment for booking #{payment.booking.id} has been {'received' if payment.status == 'completed' else 'failed'}.

        Amount: ${payment.amount}
        Service: {payment.booking.service.title}

        {'Thank you for using SkillHub Africa!' if payment.status == 'completed' else 'Please try again or contact support.'}

        Best regards,
        SkillHub Africa Team
        """

        NotificationService.send_email_notification(user.email, subject, message, user)

        # SMS notification
        sms_message = f"Payment {'received' if payment.status == 'completed' else 'failed'} for ${payment.amount}"
        if user.phone:
            NotificationService.send_sms_notification(user.phone, sms_message, user)

    @staticmethod
    def send_review_notification(review):
        """
        Send notification when a review is received
        """
        artisan = review.booking.artisan

        subject = f"New Review Received - {review.rating} stars"
        message = f"""
        Hi {artisan.user.name},

        You received a new review for your work on "{review.booking.service.title}".

        Rating: {review.rating}/5 stars
        Review: {review.comment}

        This helps build your reputation on SkillHub Africa!

        Best regards,
        SkillHub Africa Team
        """

        NotificationService.send_email_notification(
            artisan.user.email, subject, message, artisan.user
        )

    @staticmethod
    def send_fraud_alert_notification(alert):
        """
        Send fraud alert notifications to admins
        """
        # This would typically send to admin users
        # For now, we'll log it and could extend to send to specific admin emails
        logger.warning(f"Fraud Alert: {alert.reason} - Severity: {alert.severity}")

        # In production, you might want to send to admin email addresses
        # admin_emails = ['admin@skillhubafrica.com']
        # for email in admin_emails:
        #     NotificationService.send_email_notification(
        #         email,
        #         f"Fraud Alert - {alert.severity}",
        #         f"Fraud detected: {alert.reason}\nDetails: {alert.details}",
        #         None  # No user association for admin notifications
        #     )
