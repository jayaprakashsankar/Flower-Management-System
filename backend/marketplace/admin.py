from django.contrib import admin
from .models import FlowerListing, CartItem, Order, OrderItem, ProductReview


@admin.register(FlowerListing)
class FlowerListingAdmin(admin.ModelAdmin):
    list_display  = ['name','category','vendor_role','seller','price','unit','stock_quantity','grade','is_active','created_at']
    list_filter   = ['category','vendor_role','grade','is_active','return_policy']
    search_fields = ['name','seller__username','seller__first_name','location']
    list_editable = ['is_active','price','stock_quantity']
    ordering      = ['-created_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display  = ['customer','listing','quantity','added_at']
    list_filter   = ['added_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ['id','customer','status','payment_method','total_amount','tracking_code','placed_at']
    list_filter   = ['status','payment_method','placed_at']
    search_fields = ['customer__username','tracking_code']
    list_editable = ['status']
    ordering      = ['-placed_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display  = ['order','listing','quantity','unit_price']


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display  = ['reviewer','target_user','review_type','rating','is_public','created_at']
    list_filter   = ['review_type','rating','is_public']
    list_editable = ['is_public']
