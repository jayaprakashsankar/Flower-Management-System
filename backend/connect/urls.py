from django.urls import path
from . import views

urlpatterns = [
    # People directory
    path('people/',                  views.PeopleListView.as_view(),           name='people-list'),
    path('people/<int:pk>/',         views.PeopleDetailView.as_view(),          name='people-detail'),

    # Connections
    path('connections/',             views.ConnectionListCreateView.as_view(),  name='connection-list'),
    path('connections/<int:pk>/',    views.ConnectionDetailView.as_view(),      name='connection-detail'),

    # Follows
    path('follows/',                 views.FollowListCreateView.as_view(),      name='follow-list'),
    path('follows/<int:pk>/',        views.FollowDetailView.as_view(),          name='follow-detail'),

    # Messages
    path('messages/',                views.DirectMessageListCreateView.as_view(), name='message-list'),

    # Reviews
    path('reviews/',                 views.ReviewListCreateView.as_view(),      name='review-list'),

    # Notifications
    path('notifications/',           views.NotificationListView.as_view(),      name='notif-list'),
    path('notifications/mark-read/', views.NotificationMarkReadView.as_view(),  name='notif-mark-read'),
    path('notifications/send/',      views.SendNotificationView.as_view(),       name='notif-send'),

    # Rate board
    path('rates/',                   views.RateBoardListCreateView.as_view(),   name='rate-board-list'),
    path('rates/<int:pk>/',          views.RateBoardDetailView.as_view(),       name='rate-board-detail'),

    # SSE: real-time notifications
    path('live/<int:user_id>/',      views.NotificationSSEView.as_view(),       name='notif-live'),
]
