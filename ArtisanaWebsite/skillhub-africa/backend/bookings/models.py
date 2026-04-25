from django.db import models
from users.models import User
from bundles.models import Team
from projects.models import Project


class Availability(models.Model):
    professional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availabilities')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.professional.name} on {self.date} from {self.start_time} to {self.end_time}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_bookings')
    professional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='professional_bookings')
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    project = models.OneToOneField(Project, on_delete=models.CASCADE, null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bookings_bookings'

    def __str__(self):
        if self.project:
            return str(self.project.title.get('en', 'Booking'))
        return f"Booking for {self.professional.name} on {self.scheduled_date}"
