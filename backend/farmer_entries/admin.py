from django.contrib import admin
from .models import FarmerProfile, FarmerDailyEntry

@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'farm_name', 'phone', 'location', 'status')
    search_fields = ('name', 'farm_name', 'phone')
    list_filter = ('status',)

@admin.register(FarmerDailyEntry)
class FarmerDailyEntryAdmin(admin.ModelAdmin):
    list_display = ('entry_date', 'farmer', 'flower_type', 'weight_kg', 'rate_per_kg', 'total_amount', 'agent_name')
    list_filter = ('flower_type', 'entry_date')
    search_fields = ('farmer__name', 'agent_name', 'flower_type')
    date_hierarchy = 'entry_date'
