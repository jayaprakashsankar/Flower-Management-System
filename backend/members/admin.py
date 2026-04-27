from django.contrib import admin
from .models import Member

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['store_name','owner_name','phone','status','billing_cycle','comm_type','comm_value','created_at']
    list_filter  = ['status','billing_cycle','comm_type']
    search_fields= ['store_name','owner_name','phone']
    list_editable= ['status']
