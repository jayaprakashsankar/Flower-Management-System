from django.urls import path
from . import views
from .harvest_views import FarmerHarvestStatusView, FarmerGroupStatusView

urlpatterns = [
    # Farmer Profiles
    path('',                           views.FarmerListCreateView.as_view(),    name='farmer-list'),
    path('<int:pk>/',                  views.FarmerDetailView.as_view(),         name='farmer-detail'),

    # Daily Entries (agent enters)
    path('entries/',                   views.FarmerEntryListCreateView.as_view(),   name='farmer-entry-list'),
    path('entries/<int:pk>/',          views.FarmerEntryDetailView.as_view(),        name='farmer-entry-detail'),

    # Dashboard summary
    path('dashboard/<int:farmer_id>/', views.FarmerDashboardView.as_view(),     name='farmer-dashboard'),

    # SSE real-time stream (farmer watches their own data)
    path('live/<int:farmer_id>/',      views.FarmerSSEView.as_view(),           name='farmer-live'),

    # Harvest status (farmer → agent real-time via WebSocket)
    path('harvest-status/',            FarmerHarvestStatusView.as_view(),       name='harvest-status'),

    # Group status (agent sees all farmers grouped by location)
    path('group-status/',              FarmerGroupStatusView.as_view(),         name='group-status'),
]

