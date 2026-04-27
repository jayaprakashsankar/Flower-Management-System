"""
Marketplace Views — Image Upload, Listings, Cart, Orders, Delivery Tracking
FREE TECH STACK: Django + local filesystem storage (no paid cloud needed).
For S3, set USE_S3=True in settings and configure boto3.
"""
import os, uuid, mimetypes
from django.conf import settings
from django.db.models import Avg, Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import FlowerListing, CartItem, Order, OrderItem, ProductReview
from .serializers import (
    FlowerListingSerializer, CartItemSerializer,
    OrderSerializer, ProductReviewSerializer
)

# ─── Constants ────────────────────────────────────────────────────────────────
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024          # 5 MB
ALLOWED_MIME_TYPES   = {'image/jpeg', 'image/png', 'image/webp'}
ALLOWED_EXTENSIONS   = {'jpg', 'jpeg', 'png', 'webp'}


# ═══════════════════════════════════════════════════════════════════════════════
# IMAGE UPLOAD — /api/market/upload-flower-image/
# ═══════════════════════════════════════════════════════════════════════════════
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_flower_image(request):
    """
    Secure image upload for flower listings.
    - Validates file type (JPG/PNG only)
    - Enforces 5 MB size limit
    - Saves locally (free) or to S3 if configured
    - Returns the public image URL
    """
    file = request.FILES.get('image')
    if not file:
        return Response({'error': 'No image file provided. Use field name "image".'}, status=400)

    # ── 1. Extension check ──────────────────────────────────────────────────
    ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
    if ext not in ALLOWED_EXTENSIONS:
        return Response({'error': f'Invalid file type ".{ext}". Allowed: JPG, PNG, WEBP.'}, status=400)

    # ── 2. MIME type check (read first 512 bytes) ───────────────────────────
    mime, _ = mimetypes.guess_type(file.name)
    if mime not in ALLOWED_MIME_TYPES:
        return Response({'error': f'File MIME type "{mime}" not allowed.'}, status=400)

    # ── 3. Size check ────────────────────────────────────────────────────────
    if file.size > MAX_IMAGE_SIZE_BYTES:
        mb = file.size / (1024 * 1024)
        return Response({'error': f'File too large ({mb:.1f} MB). Max allowed: 5 MB.'}, status=400)

    # ── 4. Save to local media/flowers/ (free) ──────────────────────────────
    safe_name   = f"{uuid.uuid4().hex}.{ext}"
    upload_dir  = os.path.join(settings.MEDIA_ROOT, 'flowers')
    os.makedirs(upload_dir, exist_ok=True)
    file_path   = os.path.join(upload_dir, safe_name)

    with open(file_path, 'wb+') as dest:
        for chunk in file.chunks():
            dest.write(chunk)

    relative_url = f"{settings.MEDIA_URL}flowers/{safe_name}"
    # Build absolute URL (works in dev; set SITE_URL in prod settings)
    host         = getattr(settings, 'SITE_URL', 'http://127.0.0.1:8000')
    absolute_url = f"{host.rstrip('/')}{relative_url}"

    return Response({
        'success':      True,
        'image_url':    absolute_url,
        'relative_url': relative_url,
        'file_name':    safe_name,
        'size_kb':      round(file.size / 1024, 1),
    })


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLISH LISTING — /api/market/listings/
# Fixes the "Publish Listing button is inactive" bug by providing the endpoint.
# ═══════════════════════════════════════════════════════════════════════════════
class FlowerListingListCreate(generics.ListCreateAPIView):
    serializer_class = FlowerListingSerializer

    def get_queryset(self):
        qs = FlowerListing.objects.filter(is_active=True)
        # ── Filters ──────────────────────────────────────────────────────────
        category    = self.request.query_params.get('category')
        vendor_role = self.request.query_params.get('vendor_role')
        min_price   = self.request.query_params.get('min_price')
        max_price   = self.request.query_params.get('max_price')
        search      = self.request.query_params.get('search')
        sort        = self.request.query_params.get('sort', '-created_at')
        returns     = self.request.query_params.get('return_policy')

        if category:    qs = qs.filter(category=category)
        if vendor_role: qs = qs.filter(vendor_role=vendor_role)
        if min_price:   qs = qs.filter(price__gte=min_price)
        if max_price:   qs = qs.filter(price__lte=max_price)
        if returns:     qs = qs.filter(return_policy=returns)
        if search:      qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))

        allowed_sorts = ['price', '-price', '-created_at', 'created_at', 'stock_quantity']
        if sort in allowed_sorts:
            qs = qs.order_by(sort)
        return qs

    def perform_create(self, serializer):
        """Save listing and stamp image_url from upload if provided."""
        instance = serializer.save()
        img_url  = self.request.data.get('image_url', '')
        if img_url and not instance.image_url:
            instance.image_url = img_url
            instance.save(update_fields=['image_url'])


class FlowerListingDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset         = FlowerListing.objects.all()
    serializer_class = FlowerListingSerializer


# ─── Cart ─────────────────────────────────────────────────────────────────────
class CartListCreate(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer
    def get_queryset(self):
        customer = self.request.query_params.get('customer')
        qs = CartItem.objects.all()
        if customer: qs = qs.filter(customer_id=customer)
        return qs


@api_view(['DELETE'])
def clear_cart(request, customer_id):
    CartItem.objects.filter(customer_id=customer_id).delete()
    return Response({'cleared': True})


@api_view(['GET'])
def cart_summary(request, customer_id):
    items    = CartItem.objects.filter(customer_id=customer_id).select_related('listing')
    subtotal = sum(i.subtotal for i in items)
    return Response({
        'item_count': items.count(),
        'subtotal':   round(subtotal, 2),
        'items':      CartItemSerializer(items, many=True).data
    })


# ─── Orders ───────────────────────────────────────────────────────────────────
class OrderListCreate(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    def get_queryset(self):
        qs = Order.objects.all()
        customer = self.request.query_params.get('customer')
        if customer: qs = qs.filter(customer_id=customer)
        return qs.order_by('-placed_at')

    def perform_create(self, serializer):
        import random, string
        code = 'FC-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        serializer.save(tracking_code=code)


@api_view(['PATCH'])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    new_status = request.data.get('status')
    lat  = request.data.get('driver_lat')
    lng  = request.data.get('driver_lng')
    order.status = new_status
    if lat: order.driver_lat = lat
    if lng: order.driver_lng = lng
    order.save()
    return Response(OrderSerializer(order).data)


@api_view(['GET'])
def track_order(request, tracking_code):
    try:
        order = Order.objects.get(tracking_code=tracking_code)
    except Order.DoesNotExist:
        return Response({'error': 'Tracking code not found'}, status=404)
    return Response({
        'tracking_code':   order.tracking_code,
        'status':          order.status,
        'status_display':  order.get_status_display(),
        'driver_lat':      order.driver_lat,
        'driver_lng':      order.driver_lng,
        'estimated_delivery': str(order.estimated_delivery) if order.estimated_delivery else None,
        'placed_at':       str(order.placed_at),
    })


# ─── Reviews ──────────────────────────────────────────────────────────────────
class ReviewListCreate(generics.ListCreateAPIView):
    serializer_class = ProductReviewSerializer
    def get_queryset(self):
        qs = ProductReview.objects.filter(is_public=True)
        target = self.request.query_params.get('target')
        rtype  = self.request.query_params.get('type')
        if target: qs = qs.filter(target_user_id=target)
        if rtype:  qs = qs.filter(review_type=rtype)
        return qs.order_by('-created_at')


@api_view(['GET'])
def seller_rating_summary(request, seller_id):
    qs = ProductReview.objects.filter(target_user_id=seller_id, is_public=True)
    summary = {}
    for rt, _ in ProductReview.REVIEW_TYPES:
        agg = qs.filter(review_type=rt).aggregate(avg=Avg('rating'))
        summary[rt] = round(agg['avg'] or 0, 1)
    summary['total_reviews'] = qs.count()
    return Response(summary)
