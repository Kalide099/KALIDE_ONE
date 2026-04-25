from django.db import models
from users.models import User
from artisans.models import SkillCategory

class Service(models.Model):
    professional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='services')
    title = models.JSONField(default=dict, help_text='{"en": "Title", "fr": "Titre"}')
    description = models.JSONField(default=dict)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=255)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE)

    class Meta:
        db_table = 'marketplace_services'

    def __str__(self):
        return str(self.title.get('en', 'Service'))


class MentorshipSession(models.Model):
    expert = models.ForeignKey(User, on_delete=models.CASCADE, related_name='offered_mentorships')
    learner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorship_orders', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)
    is_ar_enabled = models.BooleanField(default=False, help_text="Supports live Augmented Reality stream")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Mentorship: {self.title} by {self.expert.name}"


class Masterclass(models.Model):
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='masterclasses')
    title = models.CharField(max_length=255)
    description = models.TextField()
    video_url = models.URLField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    awarded_badge = models.CharField(max_length=100, null=True, blank=True, help_text="Badge awarded upon completion")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Masterclass: {self.title}"


class KnowledgeForumPost(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=100)
    upvotes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Forum Post: {self.title}"
