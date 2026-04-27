from django.urls import path
from . import views

urlpatterns = [
    path('',               views.FlowerRateListCreateView.as_view(), name='rate-list'),
    path('<int:pk>/',      views.FlowerRateDetailView.as_view(),     name='rate-detail'),
    path('overrides/',     views.OverrideListCreateView.as_view(),   name='override-list'),
    path('overrides/<int:pk>/', views.OverrideDetailView.as_view(), name='override-detail'),
    path('resolve/',       views.ResolveRateView.as_view(),          name='rate-resolve'),
]
