"""
ASGI config with Django Channels WebSocket routing.
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'florachain.settings')

# Import consumers only after setting env var
def get_ws_routes():
    from farmer_entries.consumers import FarmerStatusConsumer, NotificationConsumer
    return [
        re_path(r'ws/farmer-status/(?P<agent_id>\w+)/$',    FarmerStatusConsumer.as_asgi()),
        re_path(r'ws/notifications/(?P<user_id>\w+)/$',     NotificationConsumer.as_asgi()),
    ]

application = ProtocolTypeRouter({
    'http':      get_asgi_application(),
    'websocket': AuthMiddlewareStack(URLRouter(get_ws_routes())),
})
