"""
Entries — Daily Entry CRUD + Bulk upsert
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers as drf_serializers
from django.db.models import Q
from .models import DailyEntry
from members.models import Member


class DailyEntrySerializer(drf_serializers.ModelSerializer):
    member_name = drf_serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DailyEntry
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.store_name if obj.member else '—'


class DailyEntryListCreateView(generics.ListCreateAPIView):
    """GET  /api/entries/?member=<id>&date=<YYYY-MM-DD>&flower=Rose&month=3&year=2026
       POST /api/entries/  — single entry create"""
    serializer_class = DailyEntrySerializer

    def get_queryset(self):
        qs = DailyEntry.objects.select_related('member')
        member = self.request.query_params.get('member')
        date   = self.request.query_params.get('date')
        flower = self.request.query_params.get('flower')
        month  = self.request.query_params.get('month')
        year   = self.request.query_params.get('year')
        if member: qs = qs.filter(member_id=member)
        if date:   qs = qs.filter(entry_date=date)
        if flower: qs = qs.filter(flower_name=flower)
        if month and year:
            qs = qs.filter(entry_date__year=year, entry_date__month=month)
        return qs.order_by('-entry_date')


class DailyEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/entries/<id>/"""
    queryset = DailyEntry.objects.all()
    serializer_class = DailyEntrySerializer


class BulkEntryView(APIView):
    """
    POST /api/entries/bulk/
    Body: { "date": "2026-03-26", "flower": "Rose", "entries": [{"member_id": 1, "quantity": 50, "luggage_charge": 0}, ...] }
    Upserts (creates or updates) entries for all members on a given date.
    """
    def post(self, request):
        date   = request.data.get('date')
        flower = request.data.get('flower', 'Rose')
        raw    = request.data.get('entries', [])
        if not date:
            return Response({'error': 'date is required'}, status=400)

        saved = []
        errors = []
        for item in raw:
            mid = item.get('member_id')
            qty = item.get('quantity', 0)
            lug = item.get('luggage_charge', 0)
            note= item.get('notes', '')
            try:
                member = Member.objects.get(id=mid)
                entry, created = DailyEntry.objects.update_or_create(
                    member=member, entry_date=date, flower_name=flower,
                    defaults={'quantity': qty, 'luggage_charge': lug, 'notes': note}
                )
                saved.append({'member_id': mid, 'created': created, 'entry_id': entry.id})
            except Member.DoesNotExist:
                errors.append({'member_id': mid, 'error': 'Member not found'})
            except Exception as e:
                errors.append({'member_id': mid, 'error': str(e)})

        return Response({'saved': len(saved), 'results': saved, 'errors': errors}, status=200)


class AutoFillZeroView(APIView):
    """
    POST /api/entries/autofill-zero/
    Body: { "date": "2026-03-26", "flower": "Rose" }
    Creates qty=0 entries for all active members that have no entry on this date.
    """
    def post(self, request):
        date   = request.data.get('date')
        flower = request.data.get('flower', 'Rose')
        active = Member.objects.filter(status='active')
        filled = 0
        for m in active:
            _, created = DailyEntry.objects.get_or_create(
                member=m, entry_date=date, flower_name=flower,
                defaults={'quantity': 0, 'luggage_charge': 0}
            )
            if created: filled += 1
        return Response({'auto_filled': filled})
