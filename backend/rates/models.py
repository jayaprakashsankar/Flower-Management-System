from django.db import models
from members.models import Member


class FlowerRate(models.Model):
    """Global default rate for a flower type."""
    flower_name    = models.CharField(max_length=100, unique=True)
    default_rate   = models.DecimalField(max_digits=10, decimal_places=2)
    effective_date = models.DateField()
    is_active      = models.BooleanField(default=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['flower_name']

    def __str__(self):
        return f"{self.flower_name} — ₹{self.default_rate}/kg"


class MemberRateOverride(models.Model):
    """Date-ranged, member-specific rate override (overrides FlowerRate)."""
    member       = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='rate_overrides')
    flower_name  = models.CharField(max_length=100)
    override_rate= models.DecimalField(max_digits=10, decimal_places=2)
    from_date    = models.DateField()
    to_date      = models.DateField(null=True, blank=True)  # null = open-ended
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-from_date']

    def __str__(self):
        return f"{self.member.store_name} — {self.flower_name} @ ₹{self.override_rate} from {self.from_date}"
