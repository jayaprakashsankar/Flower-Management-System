from django.db import models
from members.models import Member


class Bill(models.Model):
    PERIOD_CHOICES = [
        ('monthly',      'Monthly'),
        ('first_half',   '1st Half (1–15)'),
        ('second_half',  '2nd Half (16–End)'),
        ('custom',       'Custom Range'),
    ]
    STATUS_CHOICES = [
        ('draft',   'Draft'),
        ('sent',    'Sent'),
        ('paid',    'Paid'),
        ('overdue', 'Overdue'),
    ]

    bill_number       = models.CharField(max_length=30, unique=True)
    member            = models.ForeignKey(Member, on_delete=models.PROTECT, related_name='bills')
    period_type       = models.CharField(max_length=15, choices=PERIOD_CHOICES)
    period_start      = models.DateField()
    period_end        = models.DateField()
    total_quantity    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_amount      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    luggage_charges   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_payable       = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status            = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    notes             = models.TextField(blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    paid_at           = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.bill_number} — {self.member.store_name} ({self.status})"
