"""
Billing views — generate, list, export as PDF/text
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers as drf_serializers
from django.http import HttpResponse
from django.db.models import Q, Sum
from django.utils import timezone
import calendar, io

from .models import Bill
from members.models import Member
from entries.models import DailyEntry
from rates.models import FlowerRate, MemberRateOverride
from config_app.models import ShopConfig


# ── Serializer ────────────────────────────────────────────
class BillSerializer(drf_serializers.ModelSerializer):
    member_name = drf_serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Bill
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.store_name if obj.member_id else '—'


# ── Rate resolution helper ────────────────────────────────
def resolve_rate(member_id, flower_name, entry_date):
    override = MemberRateOverride.objects.filter(
        member_id=member_id, flower_name=flower_name,
        from_date__lte=entry_date,
    ).filter(
        Q(to_date__gte=entry_date) | Q(to_date__isnull=True)
    ).first()
    if override:
        return float(override.override_rate)
    rate_obj = FlowerRate.objects.filter(flower_name=flower_name, is_active=True).first()
    if rate_obj:
        return float(rate_obj.default_rate)
    return float(ShopConfig.get().default_rate)


# ── Bill computation ──────────────────────────────────────
def compute_bill(member, from_date, to_date, extra_luggage=0, comm_override=None):
    entries = DailyEntry.objects.filter(
        member=member, entry_date__range=(from_date, to_date)
    )
    total_qty = 0.0
    gross = 0.0
    luggage = float(extra_luggage)

    line_items = []
    for e in entries:
        rate = resolve_rate(member.id, e.flower_name, e.entry_date)
        amt  = float(e.quantity) * rate
        total_qty += float(e.quantity)
        gross     += amt
        luggage   += float(e.luggage_charge)
        line_items.append({
            'date': str(e.entry_date), 'flower': e.flower_name,
            'qty': float(e.quantity), 'rate': rate, 'amount': round(amt, 2),
            'luggage': float(e.luggage_charge),
        })

    if comm_override is not None:
        commission = gross * float(comm_override) / 100
    elif member.comm_type == 'percent':
        commission = gross * float(member.comm_value) / 100
    else:
        commission = float(member.comm_value)

    net = gross - commission + luggage
    return {
        'line_items': line_items,
        'total_qty': round(total_qty, 2),
        'gross': round(gross, 2),
        'commission': round(commission, 2),
        'luggage': round(luggage, 2),
        'net': round(net, 2),
    }


# ── Views ─────────────────────────────────────────────────
class BillListView(generics.ListAPIView):
    """GET /api/bills/"""
    serializer_class = BillSerializer

    def get_queryset(self):
        qs = Bill.objects.select_related('member')
        st = self.request.query_params.get('status')
        mid = self.request.query_params.get('member')
        if st:  qs = qs.filter(status=st)
        if mid: qs = qs.filter(member_id=mid)
        return qs


class BillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/bills/<id>/"""
    queryset = Bill.objects.all()
    serializer_class = BillSerializer


class GenerateBillView(APIView):
    """
    POST /api/bills/generate/
    Body: { member_id, period_type, from_date, to_date, extra_luggage, comm_override, notes }
    Computes and saves the bill.
    """
    def post(self, request):
        member_id    = request.data.get('member_id')
        period_type  = request.data.get('period_type', 'monthly')
        from_date    = request.data.get('from_date')
        to_date      = request.data.get('to_date')
        extra_lug    = float(request.data.get('extra_luggage', 0))
        comm_override= request.data.get('comm_override')  # None or float
        notes        = request.data.get('notes', '')

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response({'error': 'Member not found'}, status=404)

        if not from_date or not to_date:
            return Response({'error': 'from_date and to_date are required'}, status=400)

        calc = compute_bill(member, from_date, to_date, extra_lug, comm_override)

        # Generate bill number
        count = Bill.objects.count() + 1
        now   = timezone.now()
        bill_no = f"FC-{now.year}-{now.month:02d}-{count:04d}"

        bill = Bill.objects.create(
            bill_number=bill_no, member=member,
            period_type=period_type, period_start=from_date, period_end=to_date,
            total_quantity=calc['total_qty'],
            gross_amount=calc['gross'],
            commission_amount=calc['commission'],
            luggage_charges=calc['luggage'],
            net_payable=calc['net'],
            notes=notes, status='draft'
        )

        return Response({**BillSerializer(bill).data, 'line_items': calc['line_items']}, status=201)


class PreviewBillView(APIView):
    """
    POST /api/bills/preview/  — compute without saving
    """
    def post(self, request):
        member_id    = request.data.get('member_id')
        from_date    = request.data.get('from_date')
        to_date      = request.data.get('to_date')
        extra_lug    = float(request.data.get('extra_luggage', 0))
        comm_override= request.data.get('comm_override')
        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response({'error': 'Member not found'}, status=404)
        calc = compute_bill(member, from_date, to_date, extra_lug, comm_override)
        return Response({**calc, 'member': {'id': member.id, 'store_name': member.store_name, 'owner_name': member.owner_name, 'phone': member.phone, 'address': member.address}})


class BillTextExportView(APIView):
    """GET /api/bills/<id>/text/ — plain text bill"""
    def get(self, request, pk):
        try:
            bill = Bill.objects.select_related('member').get(pk=pk)
        except Bill.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        cfg = ShopConfig.get()
        m   = bill.member
        lines = [
            '=' * 48,
            f"  {cfg.shop_name}",
            f"  {cfg.address}",
            f"  {cfg.phone}  |  GST: {cfg.gst_number or 'N/A'}",
            '=' * 48,
            f"  Bill No: {bill.bill_number}",
            f"  Bill To: {m.store_name} ({m.owner_name})",
            f"  Phone: {m.phone}",
            f"  Period: {bill.period_start} to {bill.period_end}",
            '-' * 48,
            f"  {'Item':<30} {'Amount':>12}",
            '-' * 48,
        ]

        entries = DailyEntry.objects.filter(member=m, entry_date__range=(bill.period_start, bill.period_end))
        for e in entries:
            rate = resolve_rate(m.id, e.flower_name, e.entry_date)
            amt  = float(e.quantity) * rate
            label = f"{e.entry_date} {e.flower_name} {e.quantity}kg@{rate}"
            lines.append(f"  {label:<30} {f'Rs.{amt:.2f}':>12}")

        lines += [
            '-' * 48,
            f"  {'Total Qty':<30} {float(bill.total_quantity):.2f} kg",
            f"  {'Gross Amount':<30} {f'Rs.{float(bill.gross_amount):.2f}':>12}",
            f"  {'(-) Commission':<30} {f'Rs.{float(bill.commission_amount):.2f}':>12}",
            f"  {'(+) Luggage/Extra':<30} {f'Rs.{float(bill.luggage_charges):.2f}':>12}",
            '=' * 48,
            f"  {'NET PAYABLE':<30} {f'Rs.{float(bill.net_payable):.2f}':>12}",
            '=' * 48,
            f"  Pay via UPI: {cfg.upi_id or 'N/A'}",
            f"  Status: {bill.status.upper()}",
            '',
        ]

        text = '\n'.join(lines)
        response = HttpResponse(text, content_type='text/plain; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="Bill_{bill.bill_number}.txt"'
        return response


class BillPDFExportView(APIView):
    """GET /api/bills/<id>/pdf/ — PDF using reportlab"""
    def get(self, request, pk):
        try:
            bill = Bill.objects.select_related('member').get(pk=pk)
        except Bill.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas as rl_canvas
            from reportlab.lib import colors
        except ImportError:
            return Response({'error': 'reportlab not installed. Run: pip install reportlab'}, status=500)

        cfg = ShopConfig.get()
        m   = bill.member

        buf  = io.BytesIO()
        c    = rl_canvas.Canvas(buf, pagesize=A4)
        W, H = A4
        y    = H - 40

        def line(txt, x=50, size=10, bold=False, color=colors.black):
            nonlocal y
            c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
            c.setFillColor(color)
            c.drawString(x, y, txt)
            y -= size + 4

        line(cfg.shop_name, size=14, bold=True, color=colors.HexColor('#2E7D32'))
        line(cfg.address, size=9)
        line(f"{cfg.phone}  |  GST: {cfg.gst_number or 'N/A'}", size=9)
        y -= 6
        c.setStrokeColor(colors.HexColor('#4CAF50')); c.setLineWidth(2); c.line(50, y, W-50, y); y -= 14

        line(f"Bill No: {bill.bill_number}  |  Date: {bill.created_at.strftime('%d %b %Y')}", size=10, bold=True)
        line(f"Bill To: {m.store_name} — {m.owner_name}", size=10)
        line(f"Phone: {m.phone}  |  Period: {bill.period_start} to {bill.period_end}", size=9)
        y -= 8
        c.setStrokeColor(colors.grey); c.setLineWidth(0.5); c.line(50, y, W-50, y); y -= 12

        line("Date                 Flower    Qty       Rate      Amount", size=9, bold=True)
        c.line(50, y+4, W-50, y+4)
        y -= 4

        entries = DailyEntry.objects.filter(member=m, entry_date__range=(bill.period_start, bill.period_end))
        for e in entries:
            rate = resolve_rate(m.id, e.flower_name, e.entry_date)
            amt  = float(e.quantity) * rate
            line(f"{e.entry_date}   {e.flower_name:<10} {float(e.quantity):<8.2f} Rs.{rate:<8} Rs.{amt:.2f}", size=8.5)

        y -= 6; c.line(50, y, W-50, y); y -= 12
        line(f"Total Quantity:  {float(bill.total_quantity):.2f} kg", size=9)
        line(f"Gross Amount:    Rs.{float(bill.gross_amount):.2f}", size=9)
        line(f"(-) Commission:  Rs.{float(bill.commission_amount):.2f}", size=9, color=colors.HexColor('#E64A19'))
        line(f"(+) Luggage:     Rs.{float(bill.luggage_charges):.2f}", size=9)
        y -= 4; c.setLineWidth(2); c.line(50, y, W-50, y); y -= 14
        line(f"NET PAYABLE:     Rs.{float(bill.net_payable):.2f}", size=12, bold=True, color=colors.HexColor('#2E7D32'))
        y -= 10
        line(f"Pay via UPI: {cfg.upi_id or 'N/A'}  |  Status: {bill.status.upper()}", size=8, color=colors.grey)
        line("Thank you for your business!", size=8, color=colors.grey)

        c.save()
        buf.seek(0)
        response = HttpResponse(buf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Bill_{bill.bill_number}.pdf"'
        return response
