from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum, Q
from .models import (
    Vehicle, Attachment, EMI, Driver, WorkOrder,
    Trip, MaintenanceLog, Transaction, Review, NearbyHelpRequest
)
from .serializers import (
    VehicleSerializer, AttachmentSerializer, EMISerializer,
    DriverSerializer, WorkOrderSerializer, TripSerializer,
    MaintenanceLogSerializer, TransactionSerializer, ReviewSerializer
)


# ─── Driver Availability Toggle (BUG FIX) ────────────────────────────────────
@api_view(['PATCH'])
def toggle_driver_duty(request, driver_id):
    """Toggle on_duty status — fixes the toggle that was stuck going one-way."""
    try:
        driver = Driver.objects.get(pk=driver_id)
    except Driver.DoesNotExist:
        return Response({'error': 'Driver not found'}, status=404)
    driver.is_on_duty = not driver.is_on_duty
    driver.save(update_fields=['is_on_duty', 'updated_at'])
    return Response({
        'driver_id': driver.id,
        'is_on_duty': driver.is_on_duty,
        'status_label': 'On Duty' if driver.is_on_duty else 'Off Duty'
    })


# ─── Work Order Accept / Decline (BUG FIX) ───────────────────────────────────
@api_view(['PATCH'])
def update_work_order_status(request, wo_id):
    """Accept or decline a work order. Decline was previously broken."""
    try:
        wo = WorkOrder.objects.get(pk=wo_id)
    except WorkOrder.DoesNotExist:
        return Response({'error': 'Work order not found'}, status=404)

    new_status = request.data.get('status')
    allowed = ['accepted', 'declined', 'in_progress', 'completed']
    if new_status not in allowed:
        return Response({'error': f'Status must be one of {allowed}'}, status=400)

    wo.status = new_status
    wo.save(update_fields=['status'])
    return Response(WorkOrderSerializer(wo).data)


# ─── Vehicle CRUD ─────────────────────────────────────────────────────────────
class VehicleListCreate(generics.ListCreateAPIView):
    serializer_class = VehicleSerializer
    def get_queryset(self):
        qs = Vehicle.objects.all()
        owner = self.request.query_params.get('owner')
        if owner:
            qs = qs.filter(owner_id=owner)
        return qs


class VehicleDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


# ─── EMI CRUD ─────────────────────────────────────────────────────────────────
class EMIListCreate(generics.ListCreateAPIView):
    serializer_class = EMISerializer
    def get_queryset(self):
        qs = EMI.objects.all()
        vehicle = self.request.query_params.get('vehicle')
        if vehicle:
            qs = qs.filter(vehicle_id=vehicle)
        # Auto-flag overdue EMIs
        today = timezone.now().date()
        qs.filter(due_date__lt=today, status='active').update(status='overdue')
        return qs.order_by('due_date')


class EMIDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = EMI.objects.all()
    serializer_class = EMISerializer


# ─── Attachment CRUD ──────────────────────────────────────────────────────────
class AttachmentListCreate(generics.ListCreateAPIView):
    serializer_class = AttachmentSerializer
    def get_queryset(self):
        qs = Attachment.objects.all()
        vehicle = self.request.query_params.get('vehicle')
        if vehicle:
            qs = qs.filter(vehicle_id=vehicle)
        return qs


class AttachmentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer


# ─── Driver CRUD ──────────────────────────────────────────────────────────────
class DriverListCreate(generics.ListCreateAPIView):
    queryset = Driver.objects.select_related('user', 'vehicle').all()
    serializer_class = DriverSerializer


class DriverDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer


# ─── Work Order CRUD ──────────────────────────────────────────────────────────
class WorkOrderListCreate(generics.ListCreateAPIView):
    serializer_class = WorkOrderSerializer
    def get_queryset(self):
        qs = WorkOrder.objects.all()
        driver = self.request.query_params.get('driver')
        st = self.request.query_params.get('status')
        if driver:
            qs = qs.filter(driver_id=driver)
        if st:
            qs = qs.filter(status=st)
        return qs.order_by('-created_at')


class WorkOrderDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkOrder.objects.all()
    serializer_class = WorkOrderSerializer


# ─── Trip Control ─────────────────────────────────────────────────────────────
@api_view(['POST'])
def start_trip(request, wo_id):
    try:
        wo = WorkOrder.objects.get(pk=wo_id)
    except WorkOrder.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    trip, _ = Trip.objects.get_or_create(work_order=wo)
    trip.start_time = timezone.now()
    trip.save()
    wo.status = 'in_progress'
    wo.save(update_fields=['status'])
    return Response(TripSerializer(trip).data)


@api_view(['POST'])
def end_trip(request, wo_id):
    try:
        trip = Trip.objects.get(work_order_id=wo_id)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not started'}, status=400)
    trip.end_time = timezone.now()
    unit_count = request.data.get('unit_count', 0)
    trip.unit_count = unit_count

    # Auto-calculate cost
    wo = trip.work_order
    attachment = wo.attachment
    if attachment:
        if attachment.pricing_type == 'time':
            hours = trip.active_hours
            trip.total_cost = round(float(attachment.rate) * hours, 2)
        else:
            trip.total_cost = round(float(attachment.rate) * int(unit_count), 2)
    trip.save()
    wo.status = 'completed'
    wo.total_cost = trip.total_cost
    wo.save(update_fields=['status', 'total_cost'])
    return Response(TripSerializer(trip).data)


# ─── Maintenance Log ──────────────────────────────────────────────────────────
class MaintenanceLogListCreate(generics.ListCreateAPIView):
    serializer_class = MaintenanceLogSerializer
    def get_queryset(self):
        qs = MaintenanceLog.objects.all()
        vehicle = self.request.query_params.get('vehicle')
        if vehicle:
            qs = qs.filter(vehicle_id=vehicle)
        return qs.order_by('-date')


# ─── Financial Ledger ─────────────────────────────────────────────────────────
@api_view(['GET'])
def financial_summary(request):
    """Universal ledger: income, expenses, profit/loss for any user + role."""
    user_id = request.query_params.get('user')
    role    = request.query_params.get('role')
    qs = Transaction.objects.all()
    if user_id:
        qs = qs.filter(user_id=user_id)
    if role:
        qs = qs.filter(role=role)

    income  = float(qs.filter(tx_type='income').aggregate(s=Sum('amount'))['s'] or 0)
    expense = float(qs.filter(tx_type='expense').aggregate(s=Sum('amount'))['s'] or 0)
    return Response({
        'total_income':  income,
        'total_expense': expense,
        'net_profit':    income - expense,
        'is_profit':     income >= expense,
        'transactions':  TransactionSerializer(qs.order_by('-date')[:50], many=True).data
    })


class TransactionListCreate(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    def get_queryset(self):
        qs = Transaction.objects.all()
        user = self.request.query_params.get('user')
        role = self.request.query_params.get('role')
        if user: qs = qs.filter(user_id=user)
        if role: qs = qs.filter(role=role)
        return qs.order_by('-date')


# ─── Reviews ──────────────────────────────────────────────────────────────────
class ReviewListCreate(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    def get_queryset(self):
        qs = Review.objects.filter(is_public=True)
        target = self.request.query_params.get('target')
        rtype  = self.request.query_params.get('type')
        if target: qs = qs.filter(target_user_id=target)
        if rtype:  qs = qs.filter(review_type=rtype)
        return qs.order_by('-created_at')


# ─── Nearby Help ─────────────────────────────────────────────────────────────
@api_view(['POST'])
def send_help_request(request):
    lat  = request.data.get('lat')
    lng  = request.data.get('lng')
    desc = request.data.get('description', 'Vehicle stuck — need help!')
    user_id = request.data.get('user_id')
    vehicle_id = request.data.get('vehicle_id')
    if not lat or not lng or not user_id:
        return Response({'error': 'lat, lng, user_id required'}, status=400)
    hr = NearbyHelpRequest.objects.create(
        requester_id=user_id, vehicle_id=vehicle_id,
        lat=lat, lng=lng, description=desc
    )
    return Response({'id': hr.id, 'status': 'Help request sent to nearby vehicles!'})


# ─── Admin: Create Admin User (BUG FIX) ──────────────────────────────────────
@api_view(['POST'])
def create_admin_user(request):
    """
    Fix: Django admin was not setting is_staff/is_superuser properly.
    This endpoint ensures both flags are set correctly.
    """
    if not request.user.is_superuser:
        return Response({'error': 'Only superusers can create admin accounts'}, status=403)
    username = request.data.get('username')
    email    = request.data.get('email', '')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'username and password required'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)
    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_staff     = True   # ← BUG FIX: must set BOTH flags
    user.is_superuser = True
    user.save()
    return Response({'id': user.id, 'username': user.username, 'is_staff': True, 'is_superuser': True})
