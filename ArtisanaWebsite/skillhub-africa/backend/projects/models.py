from django.db import models
from users.models import User
from bundles.models import Team  # We renamed Bundle to Team

class Project(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.JSONField(default=dict)
    description = models.JSONField(default=dict)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    start_date = models.DateField()
    deadline = models.DateField()
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    professional = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_projects')
    escrow_released = models.BooleanField(default=False)

    class Meta:
        db_table = 'projects_projects'

    def __str__(self):
        return str(self.title.get('en', 'Project'))


class ProjectTask(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    professional = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.JSONField(default=dict)
    description = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=Project.STATUS_CHOICES, default='pending')

    class Meta:
        db_table = 'projects_tasks'

    def __str__(self):
        return str(self.title.get('en', 'Task'))


class Milestone(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('approved', 'Approved'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.JSONField(default=dict)
    description = models.JSONField(default=dict)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    class Meta:
        db_table = 'projects_milestones'

    def __str__(self):
        return str(self.title.get('en', 'Milestone'))


class ProjectUpdate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='updates')
    professional = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.JSONField(default=dict)
    media_file = models.FileField(upload_to='updates/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'projects_updates'

    def __str__(self):
        return f"Update for {self.project.title.get('en', 'Project')}"


class KalideSupplyPartner(models.Model):
    name = models.CharField(max_length=255)
    vendor_type = models.CharField(max_length=100, help_text="e.g. Hardware Store, IT Supplier")
    api_endpoint = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    wallet_address = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name


class ProcurementOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Escrow Clearing'),
        ('funded', 'Vendor Funded'),
        ('delivered', 'Delivered to Site'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='procurements')
    vendor = models.ForeignKey(KalideSupplyPartner, on_delete=models.CASCADE)
    material_list = models.JSONField(help_text="List of materials or API payload")
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    delivery_qr_code = models.CharField(max_length=50, blank=True, help_text="QR to scan on site")

    def __str__(self):
        return f"Supply Order #{self.id} for {self.project}"


class IoTTrigger(models.Model):
    milestone = models.OneToOneField(Milestone, on_delete=models.CASCADE, related_name='iot_trigger')
    device_id = models.CharField(max_length=255, unique=True, help_text="e.g. Smart Lock MAC or API token")
    activation_status = models.BooleanField(default=False)
    triggered_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"IoT Trigger for {self.milestone}"
