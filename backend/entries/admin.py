from django.contrib import admin
from .models import DailyEntry

@admin.register(DailyEntry)
class DailyEntryAdmin(admin.ModelAdmin):
    list_display = ['entry_date','member','flower_name','quantity','luggage_charge']
    list_filter  = ['flower_name','entry_date']
    search_fields= ['member__store_name','flower_name']
    date_hierarchy= 'entry_date'
