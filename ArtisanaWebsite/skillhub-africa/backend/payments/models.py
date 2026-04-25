from django.db import models
from users.models import User
from projects.models import Project


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('held', 'Held in Escrow'),
        ('released', 'Released'),
        ('cancelled', 'Cancelled'),
    ]
    project = models.OneToOneField(Project, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission = models.DecimalField(max_digits=10, decimal_places=2)
    artisan_payment = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Payment for {self.project.title}"


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    currency = models.CharField(max_length=3, default='USD')

    def __str__(self):
        return f"{self.user.name}'s wallet"


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    reference = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} {self.amount}"


class EscrowAccount(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE)
    client_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    released_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Escrow for {self.project.title}"


class Quote(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent to Client'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='quotes')
    artisan = models.ForeignKey(User, on_delete=models.CASCADE, related_name='issued_quotes')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_quotes')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    terms = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Quote #{self.id} for {self.project}"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]
    quote = models.OneToOneField(Quote, on_delete=models.SET_NULL, null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='invoices')
    artisan = models.ForeignKey(User, on_delete=models.CASCADE, related_name='issued_invoices')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invoices')
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()

    def __str__(self):
        return f"Invoice #{self.id} for {self.project}"


class SubscriptionPlan(models.Model):
    TIERS = [
        ('free', 'Free Node'),
        ('pro', 'Pro Node'),
        ('elite', 'Elite Bundle Node'),
    ]
    name = models.CharField(max_length=50, choices=TIERS, unique=True)
    price_monthly = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    max_active_projects = models.IntegerField(default=3, help_text="Limit for concurrent projects")
    features = models.JSONField(default=list)

    def __str__(self):
        return self.get_name_display()


class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.name} - {self.plan}"
