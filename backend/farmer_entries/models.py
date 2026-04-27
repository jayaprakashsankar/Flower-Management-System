"""
FarmerEntry — records agent-entered daily flower data per farmer.
These entries are visible on the farmer's dashboard in real time.
"""
from django.db import models


class FarmerProfile(models.Model):
    """Represents a registered farmer in the FloraChain ecosystem."""
    name         = models.CharField(max_length=200)
    phone        = models.CharField(max_length=15, unique=True)
    location     = models.CharField(max_length=200, blank=True)
    farm_name    = models.CharField(max_length=200, blank=True)
    flowers_grown = models.CharField(max_length=500, blank=True, help_text="Comma-separated flower types")
    upi_id       = models.CharField(max_length=100, blank=True)
    bank_details = models.TextField(blank=True)
    status       = models.CharField(max_length=10, choices=[('active','Active'),('inactive','Inactive')], default='active')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.farm_name or 'Farmer'})"


class FarmerDailyEntry(models.Model):
    """
    Daily flower data entered by an agent for a specific farmer.
    Visible in real time on the farmer's dashboard.
    """
    farmer      = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='daily_entries')
    entry_date  = models.DateField(db_index=True)
    flower_type = models.CharField(max_length=100)
    weight_kg   = models.DecimalField(max_digits=10, decimal_places=2)
    rate_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    agent_name  = models.CharField(max_length=200, blank=True, default='Agent')
    notes       = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-entry_date', '-created_at']

    def save(self, *args, **kwargs):
        # Auto-calculate total_amount
        if self.weight_kg and self.rate_per_kg:
            self.total_amount = float(self.weight_kg) * float(self.rate_per_kg)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.entry_date} | {self.farmer.name} | {self.flower_type} {self.weight_kg}kg @ ₹{self.rate_per_kg}"
