from django.contrib import admin
from .models import Bill

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display  = ['bill_number','member','period_type','period_start','period_end','net_payable','status']
    list_filter   = ['status','period_type']
    search_fields = ['bill_number','member__store_name']
    list_editable = ['status']
    readonly_fields=['bill_number']
