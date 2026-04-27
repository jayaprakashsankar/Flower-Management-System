from django.urls import path
from . import views

urlpatterns = [
    path('',               views.DailyEntryListCreateView.as_view(), name='entry-list'),
    path('<int:pk>/',      views.DailyEntryDetailView.as_view(),     name='entry-detail'),
    path('bulk/',          views.BulkEntryView.as_view(),            name='entry-bulk'),
    path('autofill-zero/', views.AutoFillZeroView.as_view(),         name='entry-autofill'),
]
