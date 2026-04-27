from rest_framework import generics, serializers as s
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import FlowerRate, MemberRateOverride


class FlowerRateSerializer(s.ModelSerializer):
    class Meta:
        model = FlowerRate
        fields = '__all__'


class OverrideSerializer(s.ModelSerializer):
    member_name = s.SerializerMethodField(read_only=True)
    class Meta:
        model = MemberRateOverride
        fields = '__all__'
    def get_member_name(self, obj):
        return obj.member.store_name


class FlowerRateListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/rates/"""
    queryset = FlowerRate.objects.filter(is_active=True)
    serializer_class = FlowerRateSerializer


class FlowerRateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/rates/<id>/"""
    queryset = FlowerRate.objects.all()
    serializer_class = FlowerRateSerializer


class OverrideListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/rates/overrides/"""
    serializer_class = OverrideSerializer
    def get_queryset(self):
        qs = MemberRateOverride.objects.select_related('member')
        mid = self.request.query_params.get('member')
        if mid: qs = qs.filter(member_id=mid)
        return qs


class OverrideDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/rates/overrides/<id>/"""
    queryset = MemberRateOverride.objects.all()
    serializer_class = OverrideSerializer


class ResolveRateView(APIView):
    """GET /api/rates/resolve/?member=<id>&flower=Rose&date=2026-03-26"""
    def get(self, request):
        from billing.views import resolve_rate
        mid    = request.query_params.get('member')
        flower = request.query_params.get('flower', 'Rose')
        date   = request.query_params.get('date')
        if not mid or not date:
            return Response({'error': 'member and date required'}, status=400)
        rate = resolve_rate(int(mid), flower, date)
        return Response({'member_id': mid, 'flower': flower, 'date': date, 'resolved_rate': rate})
