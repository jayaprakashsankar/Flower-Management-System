from django.db import models


class ShopConfig(models.Model):
    """Singleton — agent/shop configuration. Only one row should exist."""
    shop_name            = models.CharField(max_length=200, default='My Flower Agency')
    owner_name           = models.CharField(max_length=200, default='Agent Name')
    address              = models.TextField(blank=True)
    phone                = models.CharField(max_length=20, blank=True)
    gst_number           = models.CharField(max_length=20, blank=True)
    upi_id               = models.CharField(max_length=100, blank=True)
    default_flower       = models.CharField(max_length=100, default='Rose')
    default_rate         = models.DecimalField(max_digits=10, decimal_places=2, default=120.00)
    default_comm_type    = models.CharField(max_length=10, default='percent')
    default_comm_value   = models.DecimalField(max_digits=8, decimal_places=2, default=5.00)
    billing_pref         = models.CharField(max_length=15, default='monthly')
    updated_at           = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Shop Configuration'

    def __str__(self):
        return self.shop_name

    @classmethod
    def get(cls):
        """Get or create the singleton config row."""
        obj, _ = cls.objects.get_or_create(id=1)
        return obj
