from django.contrib import admin
from .models import UserProfile, Connection, Review, Notification, RateBoard

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'business_name', 'phone', 'location', 'rating', 'is_verified', 'is_active')
    list_filter = ('role', 'is_verified', 'is_active')
    search_fields = ('name', 'business_name', 'phone')

@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'purpose', 'status', 'created_at')
    list_filter = ('status', 'purpose')
    search_fields = ('from_user__name', 'to_user__name')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'reviewed', 'rating', 'created_at')
    list_filter = ('rating',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notif_type', 'title', 'is_read', 'created_at')
    list_filter = ('notif_type', 'is_read')
    search_fields = ('recipient__name', 'title')

@admin.register(RateBoard)
class RateBoardAdmin(admin.ModelAdmin):
    list_display = ('user', 'flower_type', 'action', 'rate', 'unit', 'is_active', 'valid_till')
    list_filter = ('action', 'flower_type', 'is_active')
