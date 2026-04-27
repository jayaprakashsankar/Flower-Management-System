"""
Connect — universal people-directory, connection requests, and notifications
for the FloraChain ecosystem.

Roles: farmer, agent, store_owner, driver, vehicle_operator
"""
from django.db import models


ROLE_CHOICES = [
    ('farmer',          'Farmer'),
    ('agent',           'Agent'),
    ('store_owner',     'Store Owner'),
    ('driver',          'Driver'),
    ('vehicle_operator','Vehicle Operator'),
]


class UserProfile(models.Model):
    """Universal profile record for any FloraChain user (any role)."""
    name         = models.CharField(max_length=200)
    role         = models.CharField(max_length=30, choices=ROLE_CHOICES)
    phone        = models.CharField(max_length=15, unique=True)
    location     = models.CharField(max_length=200, blank=True)
    business_name= models.CharField(max_length=200, blank=True)
    description  = models.TextField(blank=True)
    flowers      = models.CharField(max_length=500, blank=True, help_text="Comma-sep flower types they deal in")
    upi_id       = models.CharField(max_length=100, blank=True)
    rating       = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    review_count = models.PositiveIntegerField(default=0)
    is_verified  = models.BooleanField(default=False)
    is_active    = models.BooleanField(default=True)
    avatar_emoji = models.CharField(max_length=10, default='👤')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"


class Connection(models.Model):
    """Connection request between two users."""
    STATUS = [
        ('pending',   'Pending'),
        ('accepted',  'Accepted'),
        ('rejected',  'Rejected'),
    ]
    PURPOSE = [
        ('buying',    'Buying Flowers'),
        ('selling',   'Selling Flowers'),
        ('payment',   'Bill Payment'),
        ('transport', 'Flower Transport'),
        ('general',   'General Business'),
    ]
    from_user  = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_connections')
    to_user    = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='received_connections')
    purpose    = models.CharField(max_length=20, choices=PURPOSE, default='general')
    message    = models.TextField(blank=True)
    status     = models.CharField(max_length=10, choices=STATUS, default='pending')
    billing_cycle = models.CharField(
        max_length=20, 
        choices=[('daily', 'Daily'), ('half_month', 'Half-Month'), ('monthly', 'Monthly')], 
        default='monthly'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['from_user', 'to_user']]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.from_user.name} → {self.to_user.name} [{self.status}]"


class Follow(models.Model):
    """Public follow model to stay updated on people."""
    follower   = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='following')
    followed   = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['follower', 'followed']]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.name} follows {self.followed.name}"


class DirectMessage(models.Model):
    """Direct chat messages between users."""
    sender     = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_messages')
    receiver   = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='received_messages')
    content    = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Msg from {self.sender.name} to {self.receiver.name}"


class Review(models.Model):
    """Review/rating for a user profile."""
    reviewer   = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reviews_given')
    reviewed   = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reviews_received')
    rating     = models.PositiveSmallIntegerField(default=5)  # 1–5
    comment    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['reviewer', 'reviewed']]
        ordering = ['-created_at']


class Notification(models.Model):
    """Real-time notification for a user."""
    NOTIF_TYPES = [
        ('connection_request', 'Connection Request'),
        ('connection_accepted','Connection Accepted'),
        ('connection_rejected','Connection Rejected'),
        ('buy_request',        'Buy Request'),
        ('sell_offer',         'Sell Offer'),
        ('payment_received',   'Payment Received'),
        ('payment_requested',  'Payment Requested'),
        ('rate_update',        'Rate Update'),
        ('new_entry',          'New Flower Entry'),
        ('general',            'General'),
        ('message',            'New Message'),
    ]
    recipient  = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='notifications')
    notif_type = models.CharField(max_length=30, choices=NOTIF_TYPES, default='general')
    title      = models.CharField(max_length=200)
    body       = models.TextField()
    is_read    = models.BooleanField(default=False)
    from_user  = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    meta_data  = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notif_type}] → {self.recipient.name}: {self.title}"


class RateBoard(models.Model):
    """Public rate board — a user can post the rate they buy/sell at."""
    user        = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='rate_posts')
    flower_type = models.CharField(max_length=100)
    rate        = models.DecimalField(max_digits=10, decimal_places=2)
    unit        = models.CharField(max_length=20, default='kg')  # kg, dozen, stem
    action      = models.CharField(max_length=10, choices=[('buy','Buying'),('sell','Selling')], default='sell')
    min_qty     = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    is_active   = models.BooleanField(default=True)
    valid_till  = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.name} {self.action}s {self.flower_type} @ ₹{self.rate}/{self.unit}"
