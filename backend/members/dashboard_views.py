"""
Dashboard API — /api/dashboard/
Returns aggregated stats for the agent dashboard.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from members.models import Member
from entries.models import DailyEntry
from billing.models import Bill
from rates.models import FlowerRate, MemberRateOverride
from config_app.models import ShopConfig
import calendar


def resolve_rate(member_id, flower_name, entry_date):
    """Resolve the effective rate for a member+flower on a date."""
    override = MemberRateOverride.objects.filter(
        member_id=member_id,
        flower_name=flower_name,
        from_date__lte=entry_date,
    ).filter(
        models.Q(to_date__gte=entry_date) | models.Q(to_date__isnull=True)
    ).first()

    if override:
        return float(override.override_rate)

    rate_obj = FlowerRate.objects.filter(flower_name=flower_name, is_active=True).first()
    if rate_obj:
        return float(rate_obj.default_rate)

    cfg = ShopConfig.get()
    return float(cfg.default_rate)


class DashboardView(APIView):
    """GET /api/dashboard/?month=3&year=2026"""

    def get(self, request):
        now = timezone.now()
        month = int(request.query_params.get('month', now.month))
        year  = int(request.query_params.get('year',  now.year))
        _, days_in_month = calendar.monthrange(year, month)
        from_date = f"{year}-{month:02d}-01"
        to_date   = f"{year}-{month:02d}-{days_in_month:02d}"

        month_entries = DailyEntry.objects.filter(
            entry_date__range=(from_date, to_date)
        ).select_related('member')

        total_gross   = 0.0
        total_comm    = 0.0
        total_qty     = 0.0

        for entry in month_entries:
            rate  = resolve_rate(entry.member_id, entry.flower_name, entry.entry_date)
            gross = float(entry.quantity) * rate
            total_gross += gross
            total_qty   += float(entry.quantity)
            # Commission
            m = entry.member
            if m.comm_type == 'percent':
                total_comm += gross * float(m.comm_value) / 100
            else:
                total_comm += float(m.comm_value)

        # 6-month bar chart data
        monthly_data = []
        for i in range(5, -1, -1):
            d = now.replace(day=1)
            if now.month - i <= 0:
                d = d.replace(year=now.year - 1, month=12 + (now.month - i))
            else:
                d = d.replace(month=now.month - i)
            _, md = calendar.monthrange(d.year, d.month)
            ents = DailyEntry.objects.filter(
                entry_date__range=(f"{d.year}-{d.month:02d}-01", f"{d.year}-{d.month:02d}-{md:02d}")
            ).select_related('member')
            g = sum(float(e.quantity) * resolve_rate(e.member_id, e.flower_name, e.entry_date) for e in ents)
            monthly_data.append({'month': d.strftime('%b'), 'gross': round(g, 2)})

        return Response({
            'month_gross':    round(total_gross, 2),
            'month_commission': round(total_comm, 2),
            'month_net':      round(total_gross - total_comm, 2),
            'month_qty':      round(total_qty, 2),
            'active_members': Member.objects.filter(status='active').count(),
            'total_members':  Member.objects.count(),
            'total_bills':    Bill.objects.count(),
            'pending_bills':  Bill.objects.filter(status__in=['draft','overdue']).count(),
            'total_entries':  DailyEntry.objects.count(),
            'monthly_chart':  monthly_data,
        })
