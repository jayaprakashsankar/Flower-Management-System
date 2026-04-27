from django.contrib import admin
from .models import FlowerRate, MemberRateOverride

@admin.register(FlowerRate)
class FlowerRateAdmin(admin.ModelAdmin):
    list_display = ['flower_name','default_rate','effective_date','is_active']
    list_editable= ['default_rate','is_active']

@admin.register(MemberRateOverride)
class OverrideAdmin(admin.ModelAdmin):
    list_display = ['member','flower_name','override_rate','from_date','to_date']
    list_filter  = ['flower_name']
