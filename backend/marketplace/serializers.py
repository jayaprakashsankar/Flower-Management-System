from rest_framework import serializers
from .models import FlowerListing, CartItem, Order, OrderItem, ProductReview


class FlowerListingSerializer(serializers.ModelSerializer):
    seller_name      = serializers.CharField(source='seller.get_full_name', read_only=True)
    vendor_role_display = serializers.CharField(source='get_vendor_role_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    grade_display    = serializers.CharField(source='get_grade_display', read_only=True)
    unit_display     = serializers.CharField(source='get_unit_display', read_only=True)
    display_image_url= serializers.ReadOnlyField()
    class Meta:
        model  = FlowerListing
        fields = '__all__'


class CartItemSerializer(serializers.ModelSerializer):
    listing_name    = serializers.CharField(source='listing.name', read_only=True)
    listing_price   = serializers.DecimalField(source='listing.price', max_digits=10, decimal_places=2, read_only=True)
    listing_unit    = serializers.CharField(source='listing.unit', read_only=True)
    vendor_role     = serializers.CharField(source='listing.vendor_role', read_only=True)
    seller_name     = serializers.CharField(source='listing.seller.get_full_name', read_only=True)
    image_url       = serializers.CharField(source='listing.display_image_url', read_only=True)
    subtotal        = serializers.ReadOnlyField()
    class Meta:
        model  = CartItem
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    listing_name = serializers.CharField(source='listing.name', read_only=True)
    subtotal     = serializers.ReadOnlyField()
    class Meta:
        model  = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items           = OrderItemSerializer(many=True, read_only=True)
    status_display  = serializers.CharField(source='get_status_display', read_only=True)
    customer_name   = serializers.CharField(source='customer.get_full_name', read_only=True)
    class Meta:
        model  = Order
        fields = '__all__'


class ProductReviewSerializer(serializers.ModelSerializer):
    reviewer_name   = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    target_name     = serializers.CharField(source='target_user.get_full_name', read_only=True)
    review_type_display = serializers.CharField(source='get_review_type_display', read_only=True)
    class Meta:
        model  = ProductReview
        fields = '__all__'
