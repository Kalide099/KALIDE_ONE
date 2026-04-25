from django.db import models
from users.models import User
from projects.models import Project


class Review(models.Model):
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.project.title}"

    def save(self, *args, **kwargs):
        # Analyze sentiment before saving
        if not self.sentiment and self.comment:
            self.sentiment = self.analyze_sentiment()
        super().save(*args, **kwargs)

    def analyze_sentiment(self):
        """
        Analyze sentiment of the review comment
        """
        from textblob import TextBlob

        try:
            blob = TextBlob(self.comment)
            polarity = blob.sentiment.polarity

            if polarity > 0.1:
                return 'positive'
            elif polarity < -0.1:
                return 'negative'
            else:
                return 'neutral'
        except Exception:
            return 'neutral'
