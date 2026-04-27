from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ShopConfig


class ShopConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopConfig
        fields = '__all__'


class ShopConfigView(APIView):
    """GET /api/settings/  PUT /api/settings/"""
    def get(self, request):
        cfg = ShopConfig.get()
        return Response(ShopConfigSerializer(cfg).data)

    def put(self, request):
        cfg = ShopConfig.get()
        ser = ShopConfigSerializer(cfg, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=400)
