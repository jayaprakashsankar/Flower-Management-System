"""
Marketplace Models — Flower E-Commerce
Supports: Product listings, Orders, Cart, Reviews, Delivery tracking
"""
import os
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.utils import timezone


VENDOR_ROLES = [
    ('farmer',      'Farmer'),
    ('agent',       'Agent'),
    ('store_owner', 'Store Owner'),
]

FLOWER_CATEGORIES = [
    ('rose',       'Rose'),
    ('marigold',   'Marigold'),
    ('jasmine',    'Jasmine'),
    ('lotus',      'Lotus'),
    ('gerbera',    'Gerbera'),
    ('lily',       'Lily'),
    ('sunflower',  'Sunflower'),
    ('bouquet',    'Bouquet'),
    ('garland',    'Garland'),
    ('other',      'Other'),
]

GRADES = [
    ('A_premium', 'Grade A — Premium'),
    ('B_standard','Grade B — Standard'),
    ('C_economy', 'Grade C — Economy'),
]


def flower_image_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'flowers/{instance.seller.id}/{instance.category}_{timezone.now().strftime("%Y%m%d%H%M%S")}.{ext}'


class FlowerListing(models.Model):
    """Product listing by Farmer / Agent / Store Owner."""
    UNIT_CHOICES = [('kg','per kg'),('bunch','per bunch'),('piece','per piece'),('dozen','per dozen')]
    RETURN_CHOICES = [('returnable','Returnable'),('non_returnable','Non-Returnable')]

    seller          = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    vendor_role     = models.CharField(max_length=15, choices=VENDOR_ROLES)
    category        = models.CharField(max_length=15, choices=FLOWER_CATEGORIES)
    name            = models.CharField(max_length=200)
    grade           = models.CharField(max_length=15, choices=GRADES, default='B_standard')
    description     = models.TextField(blank=True)
    price           = models.DecimalField(max_digits=10, decimal_places=2)
    unit            = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')
    stock_quantity  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_order_qty   = models.DecimalField(max_digits=8, decimal_places=2, default=1)
    return_policy   = models.CharField(max_length=20, choices=RETURN_CHOICES, default='non_returnable')
    # Image stored locally (free) — S3 URL stored in image_url if cloud used
    image           = models.ImageField(
        upload_to=flower_image_path, null=True, blank=True,
        validators=[FileExtensionValidator(['jpg','jpeg','png','webp'])]
    )
    image_url       = models.URLField(blank=True)  # populated after upload
    is_active       = models.BooleanField(default=True)
    location        = models.CharField(max_length=200, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_vendor_role_display()}) ₹{self.price}/{self.unit}"

    @property
    def display_image_url(self):
        if self.image_url:
            return self.image_url
        if self.image:
            return self.image.url
        return '/assets/logo.png'  # fallback


class CartItem(models.Model):
    customer    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    listing     = models.ForeignKey(FlowerListing, on_delete=models.CASCADE)
    quantity    = models.DecimalField(max_digits=8, decimal_places=2, default=1)
    added_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'listing')

    @property
    def subtotal(self):
        return float(self.listing.price) * float(self.quantity)


ORDER_STATUS = [
    ('placed',      'Order Placed'),
    ('confirmed',   'Confirmed by Vendor'),
    ('packed',      'Packed'),
    ('dispatched',  'Dispatched'),
    ('out_delivery','Out for Delivery'),
    ('delivered',   'Delivered'),
    ('cancelled',   'Cancelled'),
]

PAYMENT_METHODS = [
    ('cod',    'Cash on Delivery'),
    ('online', 'Online Payment'),
]


class Order(models.Model):
    customer        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    payment_method  = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    status          = models.CharField(max_length=15, choices=ORDER_STATUS, default='placed')
    total_amount    = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_address= models.TextField()
    tracking_code   = models.CharField(max_length=30, blank=True, unique=True)
    driver          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                        related_name='delivery_orders')
    driver_lat      = models.FloatField(null=True, blank=True)
    driver_lng      = models.FloatField(null=True, blank=True)
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    placed_at       = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.pk} by {self.customer} — {self.status}"


class OrderItem(models.Model):
    order       = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    listing     = models.ForeignKey(FlowerListing, on_delete=models.PROTECT)
    quantity    = models.DecimalField(max_digits=8, decimal_places=2)
    unit_price  = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def subtotal(self):
        return float(self.unit_price) * float(self.quantity)


class ProductReview(models.Model):
    REVIEW_TYPES = [
        ('product',  'Product Quality'),
        ('service',  'Seller Service'),
        ('delivery', 'Delivery Punctuality'),
    ]
    order       = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='reviews')
    reviewer    = models.ForeignKey(User, on_delete=models.CASCADE)
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='market_reviews')
    review_type = models.CharField(max_length=15, choices=REVIEW_TYPES)
    rating      = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment     = models.TextField(blank=True)
    is_public   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('order', 'reviewer', 'target_user', 'review_type')

    def __str__(self):
        return f"{self.reviewer}→{self.target_user}: {self.rating}⭐ ({self.review_type})"
