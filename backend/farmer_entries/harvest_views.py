"""
Farmer harvest status HTTP API — triggers WebSocket broadcast to agent.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import FarmerProfile, FarmerDailyEntry
from .consumers import FarmerStatusConsumer


class FarmerHarvestStatusView(APIView):
    """
    POST /api/farmers/harvest-status/
    Body: {
        farmer_id, agent_id, status: 'started'|'in_progress'|'completed',
        flower_type, estimated_weight, location: {lat, lng, label}, notes
    }
    Broadcasts real-time update to agent via WebSocket.
    """

    def post(self, request):
        farmer_id     = request.data.get('farmer_id')
        agent_id      = request.data.get('agent_id')
        status        = request.data.get('status', 'started')
        flower_type   = request.data.get('flower_type', 'Rose')
        est_weight    = request.data.get('estimated_weight', 0)
        location      = request.data.get('location', {})
        notes         = request.data.get('notes', '')

        try:
            farmer = FarmerProfile.objects.get(id=farmer_id)
        except FarmerProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=404)

        now = timezone.localtime()

        EMOJI = {'started': '🌱', 'in_progress': '⚡', 'completed': '✅'}
        LABEL = {'started': 'Started Harvesting', 'in_progress': 'In Progress', 'completed': 'Completed'}

        payload = {
            'event':          'farmer_harvest_status',
            'farmer_id':      farmer.id,
            'farmer_name':    farmer.name,
            'farm_name':      farmer.farm_name or farmer.location,
            'status':         status,
            'status_label':   LABEL.get(status, status),
            'emoji':          EMOJI.get(status, '🌸'),
            'flower_type':    flower_type,
            'estimated_weight': est_weight,
            'location':       location,
            'notes':          notes,
            'timestamp':      now.isoformat(),
            'time_display':   now.strftime('%I:%M %p'),
        }

        # Broadcast via WebSocket to agent's group
        if agent_id:
            try:
                FarmerStatusConsumer.broadcast_to_agent(agent_id, payload)
            except Exception as e:
                # Channel layer not configured → fall back to SSE polling
                payload['ws_error'] = str(e)

        return Response({'ok': True, 'broadcasted': bool(agent_id), 'payload': payload})


class FarmerGroupStatusView(APIView):
    """
    GET /api/farmers/group-status/?agent_id=<id>&location=Mysuru
    Returns all farmers grouped by location with their current harvest status.
    """

    def get(self, request):
        agent_id = request.query_params.get('agent_id')
        loc_filter = request.query_params.get('location', '').lower()

        farmers = FarmerProfile.objects.filter(status='active')
        if loc_filter:
            farmers = farmers.filter(location__icontains=loc_filter)

        today = timezone.localdate()
        from django.db.models import Sum

        results = []
        for f in farmers:
            today_entries = FarmerDailyEntry.objects.filter(farmer=f, entry_date=today)
            agg = today_entries.aggregate(tw=Sum('weight_kg'), ti=Sum('total_amount'))
            results.append({
                'farmer_id':    f.id,
                'name':         f.name,
                'farm_name':    f.farm_name,
                'location':     f.location,
                'phone':        f.phone,
                'flowers':      [x.strip() for x in f.flowers_grown.split(',') if x.strip()],
                'today_weight': float(agg['tw'] or 0),
                'today_income': float(agg['ti'] or 0),
                'entry_count':  today_entries.count(),
            })

        # Group by location
        grouped = {}
        for r in results:
            loc = r['location'] or 'Unknown'
            grouped.setdefault(loc, []).append(r)

        return Response({'date': str(today), 'groups': grouped, 'total_farmers': len(results)})
