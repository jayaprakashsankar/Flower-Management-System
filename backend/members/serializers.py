from rest_framework import serializers
from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

    def validate_phone(self, value):
        cleaned = ''.join(filter(str.isdigit, value))
        if len(cleaned) < 10:
            raise serializers.ValidationError("Enter a valid 10-digit mobile number.")
        return cleaned

    def validate_comm_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Commission value cannot be negative.")
        return value
