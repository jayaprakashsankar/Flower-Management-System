from django.urls import path
from .views import ShopConfigView

urlpatterns = [
    path('', ShopConfigView.as_view(), name='settings'),
]
