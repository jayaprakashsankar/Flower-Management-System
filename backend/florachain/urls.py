from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from florachain import admin_config  # noqa: F401 — applies User admin fix

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/members/',        include('members.urls')),
    path('api/entries/',        include('entries.urls')),
    path('api/rates/',          include('rates.urls')),
    path('api/bills/',          include('billing.urls')),
    path('api/settings/',       include('config_app.urls')),
    path('api/dashboard/',      include('members.dashboard_urls')),
    path('api/vehicles/',       include('vehicles.urls')),
    path('api/farmers/',        include('farmer_entries.urls')),
    path('api/connect/',        include('connect.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
