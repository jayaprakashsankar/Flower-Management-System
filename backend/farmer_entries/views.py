"""
Views for FarmerEntry — agent enters data, farmer sees it in real time.
Uses SSE (Server-Sent Events) for real-time push to farmer dashboard.
"""
from django.http import StreamingHttpResponse
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers as drf_serializers
from django.db.models import Q, Sum
from django.utils import timezone
from .models import FarmerProfile, FarmerDailyEntry
import json
import time
import queue
import threading

# ── Global SSE broker ─────────────────────────────────────────────
# Maps farmer_id → list of queues (one per open SSE connection)
_sse_subscribers = {}
_sse_lock = threading.Lock()


def push_to_farmer(farmer_id, event_data):
    """Push an event to all open SSE connections for a given farmer."""
    with _sse_lock:
        queues = _sse_subscribers.get(farmer_id, [])
        for q in queues:
            try:
                q.put_nowait(event_data)
            except Exception:
                pass


# ── Serializers ───────────────────────────────────────────────────
class FarmerProfileSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = '__all__'


class FarmerDailyEntrySerializer(drf_serializers.ModelSerializer):
    farmer_name = drf_serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FarmerDailyEntry
        fields = '__all__'

    def get_farmer_name(self, obj):
        return obj.farmer.name if obj.farmer else '—'

    def validate(self, data):
        # Auto-compute total
        w = data.get('weight_kg', 0)
        r = data.get('rate_per_kg', 0)
        data['total_amount'] = float(w) * float(r)
        return data


# ── Farmer Profiles ───────────────────────────────────────────────
class FarmerListCreateView(generics.ListCreateAPIView):
    """GET /api/farmers/   POST /api/farmers/"""
    serializer_class = FarmerProfileSerializer

    def get_queryset(self):
        qs = FarmerProfile.objects.all()
        search = self.request.query_params.get('search', '')
        status = self.request.query_params.get('status', '')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(farm_name__icontains=search) | Q(location__icontains=search))
        if status:
            qs = qs.filter(status=status)
        return qs


class FarmerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/farmers/<id>/"""
    queryset = FarmerProfile.objects.all()
    serializer_class = FarmerProfileSerializer


# ── Daily Entries ───────────────────────────────────────────────
class FarmerEntryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/farmer-entries/?farmer=<id>&date=<YYYY-MM-DD>&month=3&year=2026
    POST /api/farmer-entries/  — agent submits new entry; triggers real-time push to farmer
    """
    serializer_class = FarmerDailyEntrySerializer

    def get_queryset(self):
        qs = FarmerDailyEntry.objects.select_related('farmer')
        farmer = self.request.query_params.get('farmer')
        date   = self.request.query_params.get('date')
        flower = self.request.query_params.get('flower')
        month  = self.request.query_params.get('month')
        year   = self.request.query_params.get('year')
        if farmer: qs = qs.filter(farmer_id=farmer)
        if date:   qs = qs.filter(entry_date=date)
        if flower: qs = qs.filter(flower_type=flower)
        if month and year:
            qs = qs.filter(entry_date__year=year, entry_date__month=month)
        return qs.order_by('-entry_date', '-created_at')

    def perform_create(self, serializer):
        entry = serializer.save()
        # Push real-time event to farmer's SSE connections
        event_data = {
            'type': 'new_entry',
            'entry': {
                'id': entry.id,
                'farmer_id': entry.farmer_id,
                'farmer_name': entry.farmer.name,
                'entry_date': str(entry.entry_date),
                'flower_type': entry.flower_type,
                'weight_kg': float(entry.weight_kg),
                'rate_per_kg': float(entry.rate_per_kg),
                'total_amount': float(entry.total_amount or 0),
                'agent_name': entry.agent_name,
                'notes': entry.notes,
                'created_at': entry.created_at.isoformat(),
            }
        }
        push_to_farmer(entry.farmer_id, event_data)


class FarmerEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/farmer-entries/<id>/"""
    queryset = FarmerDailyEntry.objects.all()
    serializer_class = FarmerDailyEntrySerializer

    def perform_update(self, serializer):
        entry = serializer.save()
        event_data = {
            'type': 'update_entry',
            'entry': {
                'id': entry.id,
                'farmer_id': entry.farmer_id,
                'entry_date': str(entry.entry_date),
                'flower_type': entry.flower_type,
                'weight_kg': float(entry.weight_kg),
                'rate_per_kg': float(entry.rate_per_kg),
                'total_amount': float(entry.total_amount or 0),
            }
        }
        push_to_farmer(entry.farmer_id, event_data)


# ── Farmer Dashboard Summary ──────────────────────────────────────
class FarmerDashboardView(APIView):
    """GET /api/farmer-entries/dashboard/<farmer_id>/"""

    def get(self, request, farmer_id):
        try:
            farmer = FarmerProfile.objects.get(id=farmer_id)
        except FarmerProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=404)

        today = timezone.localdate()
        month_entries = FarmerDailyEntry.objects.filter(
            farmer_id=farmer_id,
            entry_date__year=today.year,
            entry_date__month=today.month
        )
        today_entries = FarmerDailyEntry.objects.filter(farmer_id=farmer_id, entry_date=today)

        agg = month_entries.aggregate(
            total_weight=Sum('weight_kg'),
            total_income=Sum('total_amount'),
        )

        recent = list(
            FarmerDailyEntry.objects.filter(farmer_id=farmer_id)
            .order_by('-entry_date', '-created_at')[:10]
            .values('id', 'entry_date', 'flower_type', 'weight_kg', 'rate_per_kg', 'total_amount', 'agent_name', 'notes', 'created_at')
        )

        return Response({
            'farmer': FarmerProfileSerializer(farmer).data,
            'today_entries': list(today_entries.values()),
            'month_summary': {
                'total_weight_kg': float(agg['total_weight'] or 0),
                'total_income': float(agg['total_income'] or 0),
                'entry_count': month_entries.count(),
            },
            'recent_entries': recent,
        })


# ── SSE: Real-time stream for farmer dashboard ────────────────────
class FarmerSSEView(APIView):
    """
    GET /api/farmer-entries/live/<farmer_id>/
    Opens a Server-Sent Events stream so the farmer's dashboard receives
    real-time updates whenever an agent submits a new entry.
    """

    def get(self, request, farmer_id):
        q = queue.Queue(maxsize=50)
        with _sse_lock:
            _sse_subscribers.setdefault(farmer_id, []).append(q)

        def event_stream():
            try:
                # Send initial connected event
                yield f"data: {json.dumps({'type':'connected','farmer_id':farmer_id})}\n\n"
                while True:
                    try:
                        data = q.get(timeout=25)
                        yield f"data: {json.dumps(data)}\n\n"
                    except queue.Empty:
                        # Send heartbeat every 25 s to keep connection alive
                        yield f"data: {json.dumps({'type':'heartbeat'})}\n\n"
            finally:
                with _sse_lock:
                    try:
                        _sse_subscribers.get(farmer_id, []).remove(q)
                    except ValueError:
                        pass

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        response['Access-Control-Allow-Origin'] = '*'
        return response
