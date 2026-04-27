from django.db import models


class Member(models.Model):
    """A buyer/customer of the agent — store owner who receives flowers."""
    BILLING_CHOICES = [
        ('monthly',      'Monthly'),
        ('first_half',   '1st Half (1–15)'),
        ('second_half',  '2nd Half (16–End)'),
    ]
    COMM_CHOICES = [
        ('percent', 'Percentage (%)'),
        ('fixed',   'Fixed Amount (₹)'),
    ]
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive')]

    store_name    = models.CharField(max_length=200)
    owner_name    = models.CharField(max_length=200)
    phone         = models.CharField(max_length=15, unique=True)
    address       = models.TextField(blank=True)
    status        = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    billing_cycle = models.CharField(max_length=15, choices=BILLING_CHOICES, default='monthly')
    comm_type     = models.CharField(max_length=10, choices=COMM_CHOICES, default='percent')
    comm_value    = models.DecimalField(max_digits=8, decimal_places=2, default=5.00)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['store_name']

    def __str__(self):
        return f"{self.store_name} ({self.owner_name})"
