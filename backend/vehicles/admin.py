from django.contrib import admin
from .models import (
    Vehicle, Attachment, EMI, Driver, WorkOrder,
    Trip, MaintenanceLog, Transaction, Review, NearbyHelpRequest
)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display  = ['reg_number', 'type', 'model', 'owner', 'capacity_kg', 'is_available']
    list_filter   = ['type', 'is_available']
    search_fields = ['reg_number', 'model', 'owner__username']
    list_editable = ['is_available']


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'vehicle', 'pricing_type', 'rate', 'is_available']
    list_filter  = ['pricing_type', 'is_available']
    list_editable = ['is_available']


@admin.register(EMI)
class EMIAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'lender', 'total_loan', 'amount_paid', 'emi_amount', 'due_date', 'status']
    list_filter  = ['status']
    list_editable = ['status']
    ordering = ['due_date']


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display  = ['user', 'vehicle', 'license_no', 'phone', 'is_on_duty', 'live_tracking_enabled']
    list_filter   = ['is_on_duty', 'live_tracking_enabled']
    search_fields = ['user__username', 'user__first_name', 'license_no', 'phone']
    list_editable = ['is_on_duty']


@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display  = ['id', 'customer_name', 'from_location', 'to_location', 'status', 'scheduled_date', 'payment_status']
    list_filter   = ['status', 'payment_status', 'scheduled_date']
    search_fields = ['customer_name', 'customer_phone', 'from_location', 'to_location']
    list_editable = ['status', 'payment_status']


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['work_order', 'start_time', 'end_time', 'break_duration_mins', 'total_cost', 'distance_km']


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'log_type', 'description', 'cost', 'odometer_km', 'date']
    list_filter  = ['log_type', 'date']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display  = ['user', 'role', 'tx_type', 'amount', 'description', 'date']
    list_filter   = ['role', 'tx_type', 'date']
    search_fields = ['user__username', 'description', 'ref_id']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ['reviewer', 'target_user', 'review_type', 'rating', 'is_public', 'created_at']
    list_filter   = ['review_type', 'rating', 'is_public']
    list_editable = ['is_public']


@admin.register(NearbyHelpRequest)
class NearbyHelpRequestAdmin(admin.ModelAdmin):
    list_display = ['requester', 'vehicle', 'status', 'lat', 'lng', 'created_at']
    list_filter  = ['status']
