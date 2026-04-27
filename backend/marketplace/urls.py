from django.urls import path
from . import views

urlpatterns = [
    # Image upload (fixes "Publish Listing button inactive" bug)
    path('upload-flower-image/',        views.upload_flower_image,          name='upload-flower-image'),

    # Listings
    path('listings/',                   views.FlowerListingListCreate.as_view(), name='listing-list'),
    path('listings/<int:pk>/',          views.FlowerListingDetail.as_view(),     name='listing-detail'),

    # Cart
    path('cart/',                       views.CartListCreate.as_view(),          name='cart-list'),
    path('cart/<int:customer_id>/summary/', views.cart_summary,                 name='cart-summary'),
    path('cart/<int:customer_id>/clear/',   views.clear_cart,                   name='cart-clear'),

    # Orders
    path('orders/',                     views.OrderListCreate.as_view(),         name='order-list'),
    path('orders/<int:order_id>/status/', views.update_order_status,             name='order-status'),
    path('track/<str:tracking_code>/',  views.track_order,                       name='order-track'),

    # Reviews
    path('reviews/',                    views.ReviewListCreate.as_view(),         name='market-review-list'),
    path('sellers/<int:seller_id>/rating/', views.seller_rating_summary,         name='seller-rating'),
]
