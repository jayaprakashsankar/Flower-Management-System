from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Vehicle(models.Model):
    VEHICLE_TYPES = [
        ('tractor', 'Tractor'), ('truck', 'Truck'), ('mini_van', 'Mini Van'),
        ('tempo', 'Tempo'), ('jcb', 'JCB'), ('lorry', 'Lorry'), ('two_wheeler', 'Two Wheeler'),
    ]
    owner       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    type        = models.CharField(max_length=20, choices=VEHICLE_TYPES)
    reg_number  = models.CharField(max_length=20, unique=True)
    model       = models.CharField(max_length=100, blank=True)
    capacity_kg = models.PositiveIntegerField(default=500)
    is_available= models.BooleanField(default=True)
    rate_per_km = models.DecimalField(max_digits=8, decimal_places=2, default=12)
    base_charge = models.DecimalField(max_digits=8, decimal_places=2, default=300)
    insurance_expiry = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reg_number} ({self.get_type_display()})"


class Attachment(models.Model):
    PRICING_TYPES = [('time', 'Per Hour'), ('count', 'Per Unit Count')]
    vehicle     = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='attachments')
    name        = models.CharField(max_length=100)  # Rotavator, Paddy Grass, etc.
    pricing_type= models.CharField(max_length=10, choices=PRICING_TYPES, default='time')
    rate        = models.DecimalField(max_digits=10, decimal_places=2)  # ₹/hr or ₹/unit
    is_available= models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.get_pricing_type_display()} @ ₹{self.rate})"


class EMI(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('overdue', 'Overdue'), ('paid', 'Fully Paid')]
    vehicle         = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='emis')
    lender          = models.CharField(max_length=200, blank=True)
    total_loan      = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid     = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    emi_amount      = models.DecimalField(max_digits=10, decimal_places=2)
    due_date        = models.DateField()
    status          = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at      = models.DateTimeField(auto_now_add=True)

    @property
    def remaining_balance(self):
        return self.total_loan - self.amount_paid

    @property
    def completion_pct(self):
        if self.total_loan == 0:
            return 0
        return round((float(self.amount_paid) / float(self.total_loan)) * 100, 1)

    def __str__(self):
        return f"EMI for {self.vehicle} — ₹{self.emi_amount} due {self.due_date}"


class Driver(models.Model):
    user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    vehicle     = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='drivers')
    license_no  = models.CharField(max_length=50, blank=True)
    license_expiry = models.DateField(null=True, blank=True)
    phone       = models.CharField(max_length=15, blank=True)
    photo       = models.ImageField(upload_to='drivers/', null=True, blank=True)
    is_on_duty  = models.BooleanField(default=False)
    live_tracking_enabled = models.BooleanField(default=True)
    upi_id      = models.CharField(max_length=100, blank=True)
    whatsapp    = models.CharField(max_length=15, blank=True)
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Driver: {self.user.get_full_name() or self.user.username}"


class WorkOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('accepted', 'Accepted'),
        ('declined', 'Declined'), ('in_progress', 'In Progress'), ('completed', 'Completed'),
    ]
    driver          = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='work_orders')
    vehicle         = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True)
    attachment      = models.ForeignKey(Attachment, on_delete=models.SET_NULL, null=True, blank=True)
    customer_name   = models.CharField(max_length=200)
    customer_phone  = models.CharField(max_length=15, blank=True)
    from_location   = models.CharField(max_length=300)
    to_location     = models.CharField(max_length=300)
    job_lat         = models.FloatField(null=True, blank=True)
    job_lng         = models.FloatField(null=True, blank=True)
    cargo_desc      = models.CharField(max_length=300, blank=True)
    status          = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    scheduled_date  = models.DateField()
    total_cost      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_status  = models.CharField(max_length=20, default='pending')
    notes           = models.TextField(blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"WO#{self.pk} {self.from_location} → {self.to_location} [{self.status}]"


class Trip(models.Model):
    work_order  = models.OneToOneField(WorkOrder, on_delete=models.CASCADE, related_name='trip')
    start_time  = models.DateTimeField(null=True, blank=True)
    end_time    = models.DateTimeField(null=True, blank=True)
    break_duration_mins = models.PositiveIntegerField(default=0)
    unit_count  = models.PositiveIntegerField(default=0)  # for count-based pricing
    total_cost  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    distance_km = models.FloatField(null=True, blank=True)
    route_polyline = models.TextField(blank=True)

    @property
    def active_hours(self):
        if not self.start_time or not self.end_time:
            return 0
        delta = self.end_time - self.start_time
        total_mins = delta.total_seconds() / 60
        return (total_mins - self.break_duration_mins) / 60

    def __str__(self):
        return f"Trip for WO#{self.work_order_id}"


class MaintenanceLog(models.Model):
    LOG_TYPES = [('oil_change', 'Oil Change'), ('fuel', 'Fuel'), ('repair', 'Repair/Part'), ('other', 'Other')]
    vehicle     = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenance_logs')
    log_type    = models.CharField(max_length=15, choices=LOG_TYPES)
    description = models.CharField(max_length=300)
    cost        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    odometer_km = models.PositiveIntegerField(null=True, blank=True)
    date        = models.DateField(default=timezone.now)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_log_type_display()} — {self.vehicle} on {self.date}"


class Transaction(models.Model):
    TX_TYPES = [('income', 'Income'), ('expense', 'Expense')]
    ROLE_CHOICES = [
        ('farmer', 'Farmer'), ('agent', 'Agent'), ('store', 'Store Owner'),
        ('vehicle_owner', 'Vehicle Owner'), ('driver', 'Driver'),
    ]
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    role        = models.CharField(max_length=15, choices=ROLE_CHOICES)
    tx_type     = models.CharField(max_length=10, choices=TX_TYPES)
    amount      = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=300)
    ref_id      = models.CharField(max_length=50, blank=True)
    date        = models.DateField(default=timezone.now)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tx_type.upper()} ₹{self.amount} — {self.user}"


class Review(models.Model):
    REVIEW_TYPES = [
        ('product_quality', 'Product Quality'),
        ('provider_service', 'Provider/Service'),
        ('delivery', 'Delivery Punctuality'),
    ]
    reviewer        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    target_user     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reviews')
    review_type     = models.CharField(max_length=20, choices=REVIEW_TYPES)
    rating          = models.PositiveSmallIntegerField()  # 1-5
    comment         = models.TextField(blank=True)
    work_order      = models.ForeignKey(WorkOrder, on_delete=models.SET_NULL, null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    is_public       = models.BooleanField(default=True)

    class Meta:
        unique_together = ('reviewer', 'target_user', 'work_order', 'review_type')

    def __str__(self):
        return f"{self.reviewer} → {self.target_user}: {self.rating}⭐ ({self.get_review_type_display()})"


class NearbyHelpRequest(models.Model):
    STATUS_CHOICES = [('open', 'Open'), ('responded', 'Responded'), ('closed', 'Closed')]
    requester   = models.ForeignKey(User, on_delete=models.CASCADE)
    vehicle     = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True)
    lat         = models.FloatField()
    lng         = models.FloatField()
    description = models.TextField()
    status      = models.CharField(max_length=15, choices=STATUS_CHOICES, default='open')
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Help Request by {self.requester} at ({self.lat},{self.lng})"
