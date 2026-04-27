from django.urls import path
from . import views

urlpatterns = [
    path('',           views.BillListView.as_view(),       name='bill-list'),
    path('<int:pk>/',  views.BillDetailView.as_view(),     name='bill-detail'),
    path('generate/',  views.GenerateBillView.as_view(),   name='bill-generate'),
    path('preview/',   views.PreviewBillView.as_view(),    name='bill-preview'),
    path('<int:pk>/pdf/',  views.BillPDFExportView.as_view(), name='bill-pdf'),
    path('<int:pk>/text/', views.BillTextExportView.as_view(), name='bill-text'),
]
