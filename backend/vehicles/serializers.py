from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Vehicle, Attachment, EMI, Driver, WorkOrder, Trip, MaintenanceLog, Transaction, Review


class AttachmentSerializer(serializers.ModelSerializer):
    pricing_type_display = serializers.CharField(source='get_pricing_type_display', read_only=True)
    class Meta:
        model   = Attachment
        fields  = '__all__'


class EMISerializer(serializers.ModelSerializer):
    remaining_balance = serializers.ReadOnlyField()
    completion_pct    = serializers.ReadOnlyField()
    class Meta:
        model  = EMI
        fields = '__all__'


class VehicleSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    emis        = EMISerializer(many=True, read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    class Meta:
        model  = Vehicle
        fields = '__all__'


class DriverSerializer(serializers.ModelSerializer):
    username     = serializers.CharField(source='user.username', read_only=True)
    full_name    = serializers.CharField(source='user.get_full_name', read_only=True)
    vehicle_info = VehicleSerializer(source='vehicle', read_only=True)
    class Meta:
        model  = Driver
        fields = '__all__'


class WorkOrderSerializer(serializers.ModelSerializer):
    driver_name    = serializers.CharField(source='driver.user.get_full_name', read_only=True)
    vehicle_reg    = serializers.CharField(source='vehicle.reg_number', read_only=True)
    attachment_name= serializers.CharField(source='attachment.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    class Meta:
        model  = WorkOrder
        fields = '__all__'


class TripSerializer(serializers.ModelSerializer):
    active_hours = serializers.ReadOnlyField()
    class Meta:
        model  = Trip
        fields = '__all__'


class MaintenanceLogSerializer(serializers.ModelSerializer):
    log_type_display = serializers.CharField(source='get_log_type_display', read_only=True)
    class Meta:
        model  = MaintenanceLog
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model  = Transaction
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name    = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    target_name      = serializers.CharField(source='target_user.get_full_name', read_only=True)
    review_type_display = serializers.CharField(source='get_review_type_display', read_only=True)
    class Meta:
        model  = Review
        fields = '__all__'
