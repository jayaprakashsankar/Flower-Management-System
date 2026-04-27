from django.urls import path
from . import views

urlpatterns = [
    # Vehicles
    path('',                        views.VehicleListCreate.as_view(),        name='vehicle-list'),
    path('<int:pk>/',               views.VehicleDetail.as_view(),            name='vehicle-detail'),

    # EMI
    path('emi/',                    views.EMIListCreate.as_view(),            name='emi-list'),
    path('emi/<int:pk>/',           views.EMIDetail.as_view(),                name='emi-detail'),

    # Attachments
    path('attachments/',            views.AttachmentListCreate.as_view(),     name='attachment-list'),
    path('attachments/<int:pk>/',   views.AttachmentDetail.as_view(),         name='attachment-detail'),

    # Drivers
    path('drivers/',                views.DriverListCreate.as_view(),         name='driver-list'),
    path('drivers/<int:pk>/',       views.DriverDetail.as_view(),             name='driver-detail'),
    path('drivers/<int:driver_id>/toggle-duty/', views.toggle_driver_duty,   name='driver-toggle-duty'),

    # Work Orders
    path('workorders/',             views.WorkOrderListCreate.as_view(),      name='wo-list'),
    path('workorders/<int:pk>/',    views.WorkOrderDetail.as_view(),          name='wo-detail'),
    path('workorders/<int:wo_id>/status/', views.update_work_order_status,    name='wo-status'),

    # Trip control
    path('workorders/<int:wo_id>/start/', views.start_trip,                  name='trip-start'),
    path('workorders/<int:wo_id>/end/',   views.end_trip,                    name='trip-end'),

    # Maintenance
    path('maintenance/',            views.MaintenanceLogListCreate.as_view(), name='maint-list'),

    # Financials
    path('ledger/',                 views.TransactionListCreate.as_view(),    name='tx-list'),
    path('ledger/summary/',         views.financial_summary,                  name='ledger-summary'),

    # Reviews
    path('reviews/',                views.ReviewListCreate.as_view(),         name='review-list'),

    # Help
    path('help/',                   views.send_help_request,                  name='help-request'),

    # Admin fix
    path('admin/create-admin/',     views.create_admin_user,                  name='create-admin'),
]
