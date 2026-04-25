from django.db import models
from django.utils import timezone
from users.models import User
from projects.models import Project


class Dispute(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('investigating', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    RESOLUTION_CHOICES = [
        ('client_refund', 'Refund to Client'),
        ('artisan_payment', 'Payment to Artisan'),
        ('partial_refund', 'Partial Refund'),
        ('no_action', 'No Action Required'),
        ('escalated', 'Escalated for Further Review'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='disputes')
    initiator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='initiated_disputes')
    respondent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='responded_disputes')

    title = models.CharField(max_length=255)
    description = models.TextField()
    evidence = models.JSONField(default=dict, help_text="URLs to evidence files, messages, etc.")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')

    resolution = models.CharField(max_length=20, choices=RESOLUTION_CHOICES, null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_disputes')
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Dispute: {self.title} - {self.project.title}"

    def resolve(self, resolution, resolution_notes, resolved_by):
        """Resolve the dispute"""
        self.status = 'resolved'
        self.resolution = resolution
        self.resolution_notes = resolution_notes
        self.resolved_by = resolved_by
        self.resolved_at = timezone.now()
        self.save()

        # Create resolution notification
        from notifications.services import NotificationService
        NotificationService.send_dispute_resolution_notification(self)


class DisputeMessage(models.Model):
    dispute = models.ForeignKey(Dispute, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    attachments = models.JSONField(default=list, help_text="List of attachment URLs")
    is_admin_message = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message in {self.dispute.title} by {self.sender.name}"


class DisputeEvidence(models.Model):
    EVIDENCE_TYPE_CHOICES = [
        ('message', 'Chat Message'),
        ('file', 'File/Document'),
        ('screenshot', 'Screenshot'),
        ('contract', 'Contract/Agreement'),
        ('payment', 'Payment Record'),
        ('other', 'Other'),
    ]

    dispute = models.ForeignKey(Dispute, on_delete=models.CASCADE, related_name='evidence_files')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file_url = models.URLField()
    file_name = models.CharField(max_length=255)
    evidence_type = models.CharField(max_length=20, choices=EVIDENCE_TYPE_CHOICES)
    description = models.TextField(blank=True)

    uploaded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Evidence: {self.file_name} for {self.dispute.title}"


class JusticeNodeAISettlement(models.Model):
    dispute = models.OneToOneField(Dispute, on_delete=models.CASCADE, related_name='ai_settlement')
    ai_confidence_score = models.DecimalField(max_digits=5, decimal_places=2, help_text="AI Confidence 0-100%")
    suggested_client_refund_percentage = models.IntegerField(default=50)
    suggested_artisan_payout_percentage = models.IntegerField(default=50)
    reasoning = models.TextField(help_text="Detailed AI reasoning based on Milestones, Messages, and Contracts")
    is_accepted_by_both = models.BooleanField(default=False)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Settlement for {self.dispute}"
