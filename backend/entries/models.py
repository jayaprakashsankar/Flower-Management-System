from django.db import models
from members.models import Member


class DailyEntry(models.Model):
    """
    One entry: how much of a flower was delivered to a member on a date.
    Rate is resolved during billing (not stored here) to allow retroactive rate changes.
    """
    member         = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='daily_entries')
    entry_date     = models.DateField(db_index=True)
    flower_name    = models.CharField(max_length=100)
    quantity       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    luggage_charge = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-entry_date', 'member__store_name']
        unique_together = [['member', 'entry_date', 'flower_name']]

    def __str__(self):
        return f"{self.entry_date} | {self.member.store_name} | {self.flower_name} {self.quantity}kg"
