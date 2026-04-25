from django.db import models
from users.models import User

class SkillCategory(models.Model):
    name = models.JSONField(default=dict, help_text='{"en": "Category", "fr": "Catégorie"}')

    def __str__(self):
        return str(self.name.get('en', 'Unknown Category'))


class Badge(models.Model):
    name = models.JSONField(default=dict, help_text='{"en": "Verified Identity", "fr": "Identité Vérifiée"}')
    icon_url = models.URLField(blank=True, null=True)
    description = models.JSONField(default=dict)

    def __str__(self):
        return str(self.name.get('en', 'Badge'))


class Professional(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    skills = models.JSONField(default=list)  # list of skill json objects or identifiers
    experience_years = models.IntegerField()
    bio = models.JSONField(default=dict, help_text='{"en": "Text", "fr": "Texte"}')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    is_verified = models.BooleanField(default=False)
    completed_projects = models.IntegerField(default=0)
    portfolio_images = models.JSONField(default=list)
    badges = models.ManyToManyField(Badge, blank=True, related_name='professionals')

    class Meta:
        db_table = 'marketplace_professionals'

    def __str__(self):
        return f"{self.user.name}'s profile"


class ProfessionalVerification(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    professional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verifications')
    document_type = models.CharField(max_length=100)
    document_file = models.FileField(upload_to='verifications/')
    verification_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'trust_safety_professional_verifications'

    def __str__(self):
        return f"Verification for {self.professional.name}"


class PortfolioItem(models.Model):
    professional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolio')
    title = models.JSONField(default=dict, help_text='{"en": "Title", "fr": "Titre"}')
    description = models.JSONField(default=dict, help_text='{"en": "Description", "fr": "Description"}')
    image_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'marketplace_portfolio_items'

    def __str__(self):
        return str(self.title.get('en', 'Portfolio Item'))
