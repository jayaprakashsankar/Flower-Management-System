"""
Farmer Harvest Status — real-time WebSocket consumer using Django Channels.
Farmers click START/COMPLETE → agent receives instant notification with location.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# ─── Farmer → Agent Status Consumer ──────────────────────────────────────────
class FarmerStatusConsumer(AsyncWebsocketConsumer):
    """
    WebSocket for real-time farmer harvest status.

    URL: ws://localhost:8000/ws/farmer-status/<agent_id>/

    Agent connects to this to receive all farmer status events.
    Farmers send events by POSTing to the HTTP API which calls
    FarmerStatusConsumer.broadcast_to_agent().
    """

    async def connect(self):
        self.agent_id  = self.scope['url_route']['kwargs']['agent_id']
        self.group_name = f'agent_{self.agent_id}_farmers'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connected',
            'message': f'Listening for farmer updates (agent {self.agent_id})',
        }))

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # Agents can send ping; farmers send status via HTTP API
        try:
            data = json.loads(text_data or '{}')
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except Exception:
            pass

    # ── Triggered by channel layer group_send ──────────────────────────────────
    async def farmer_status(self, event):
        await self.send(text_data=json.dumps(event))

    # ── Helper called from HTTP views ─────────────────────────────────────────
    @staticmethod
    def broadcast_to_agent(agent_id, payload: dict):
        """Push farmer status event to the agent's WebSocket group (sync call)."""
        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            f'agent_{agent_id}_farmers',
            {'type': 'farmer_status', **payload},
        )


# ─── Notification Consumer (for Connect People notifications) ─────────────────
class NotificationConsumer(AsyncWebsocketConsumer):
    """
    URL: ws://localhost:8000/ws/notifications/<user_id>/
    All roles use this for real-time platform notifications.
    """

    async def connect(self):
        self.user_id    = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'user_{self.user_id}_notifications'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({'type': 'connected', 'user_id': self.user_id}))

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data or '{}')
            if data.get('type') == 'mark_read':
                await self.send(text_data=json.dumps({'type': 'ack', 'notif_id': data.get('notif_id')}))
        except Exception:
            pass

    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event))

    @staticmethod
    def broadcast(user_id, payload: dict):
        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            f'user_{user_id}_notifications',
            {'type': 'send_notification', **payload},
        )
