"""
Views for Connect — People Directory, Connections, Notifications, Rate Board.
Includes SSE endpoint for real-time notifications.
"""
from django.http import StreamingHttpResponse
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers as drf_serializers
from django.db.models import Q
from .models import UserProfile, Connection, Review, Notification, RateBoard, Follow, DirectMessage
import json
import queue
import threading

# ── SSE Broker for notifications ──────────────────────────────────
_notif_subscribers = {}   # user_id → [queue, ...]
_notif_lock = threading.Lock()


def push_notification(user_id, data):
    with _notif_lock:
        for q in _notif_subscribers.get(user_id, []):
            try:
                q.put_nowait(data)
            except Exception:
                pass


# ── Serializers ───────────────────────────────────────────────────
class UserProfileSerializer(drf_serializers.ModelSerializer):
    role_display = drf_serializers.CharField(source='get_role_display', read_only=True)
    flower_list  = drf_serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = '__all__'

    def get_flower_list(self, obj):
        return [f.strip() for f in obj.flowers.split(',') if f.strip()] if obj.flowers else []


class ConnectionSerializer(drf_serializers.ModelSerializer):
    from_user_name  = drf_serializers.CharField(source='from_user.name', read_only=True)
    to_user_name    = drf_serializers.CharField(source='to_user.name',   read_only=True)
    from_user_role  = drf_serializers.CharField(source='from_user.role', read_only=True)
    to_user_role    = drf_serializers.CharField(source='to_user.role',   read_only=True)
    purpose_display = drf_serializers.CharField(source='get_purpose_display', read_only=True)

    class Meta:
        model = Connection
        fields = '__all__'


class ReviewSerializer(drf_serializers.ModelSerializer):
    reviewer_name = drf_serializers.CharField(source='reviewer.name', read_only=True)
    reviewer_role = drf_serializers.CharField(source='reviewer.role', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'


class NotificationSerializer(drf_serializers.ModelSerializer):
    from_user_name = drf_serializers.CharField(source='from_user.name', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'


class RateBoardSerializer(drf_serializers.ModelSerializer):
    user_name     = drf_serializers.CharField(source='user.name',     read_only=True)
    user_role     = drf_serializers.CharField(source='user.role',     read_only=True)
    user_location = drf_serializers.CharField(source='user.location', read_only=True)
    action_display= drf_serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = RateBoard
        fields = '__all__'


class FollowSerializer(drf_serializers.ModelSerializer):
    follower_name = drf_serializers.CharField(source='follower.name', read_only=True)
    followed_name = drf_serializers.CharField(source='followed.name', read_only=True)

    class Meta:
        model = Follow
        fields = '__all__'


class DirectMessageSerializer(drf_serializers.ModelSerializer):
    sender_name = drf_serializers.CharField(source='sender.name', read_only=True)

    class Meta:
        model = DirectMessage
        fields = '__all__'

# ── People Directory ──────────────────────────────────────────────
class PeopleListView(generics.ListCreateAPIView):
    """
    GET  /api/connect/people/?role=farmer&search=Ramesh
    POST /api/connect/people/   — register a new user profile
    """
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        qs = UserProfile.objects.filter(is_active=True)
        role   = self.request.query_params.get('role', '')
        search = self.request.query_params.get('search', '')
        flower = self.request.query_params.get('flower', '')
        loc    = self.request.query_params.get('location', '')
        if role:   qs = qs.filter(role=role)
        if search: qs = qs.filter(Q(name__icontains=search) | Q(business_name__icontains=search))
        if flower: qs = qs.filter(flowers__icontains=flower)
        if loc:    qs = qs.filter(location__icontains=loc)
        return qs


class PeopleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/connect/people/<id>/"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


# ── Connections ───────────────────────────────────────────────────
class ConnectionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/connect/connections/?user=<id>
    POST /api/connect/connections/  — send a connection request
    """
    serializer_class = ConnectionSerializer

    def get_queryset(self):
        qs = Connection.objects.select_related('from_user', 'to_user')
        user = self.request.query_params.get('user')
        if user:
            qs = qs.filter(Q(from_user_id=user) | Q(to_user_id=user))
        return qs

    def perform_create(self, serializer):
        conn = serializer.save()
        # Notify the target user
        notif = Notification.objects.create(
            recipient=conn.to_user,
            notif_type='connection_request',
            title=f"Connection request from {conn.from_user.name}",
            body=f"{conn.from_user.name} ({conn.from_user.get_role_display()}) wants to connect for {conn.get_purpose_display()}. Message: {conn.message or 'No message.'}",
            from_user=conn.from_user,
            meta_data={'connection_id': conn.id, 'purpose': conn.purpose},
        )
        push_notification(conn.to_user_id, {
            'type': 'notification',
            'notification': NotificationSerializer(notif).data,
        })


class ConnectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/connect/connections/<id>/"""
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer

    def perform_update(self, serializer):
        old_status = self.get_object().status
        conn = serializer.save()
        if conn.status != old_status and old_status == 'pending':
            notif_type = 'connection_accepted' if conn.status == 'accepted' else 'connection_rejected'
            notif = Notification.objects.create(
                recipient=conn.from_user,
                notif_type=notif_type,
                title=f"Connection {conn.status} by {conn.to_user.name}",
                body=f"Your connection request was {conn.status} by {conn.to_user.name}.",
                from_user=conn.to_user,
                meta_data={'connection_id': conn.id},
            )
            push_notification(conn.from_user_id, {
                'type': 'notification',
                'notification': NotificationSerializer(notif).data,
            })


# ── Follows ───────────────────────────────────────────────────────
class FollowListCreateView(generics.ListCreateAPIView):
    serializer_class = FollowSerializer

    def get_queryset(self):
        qs = Follow.objects.all()
        follower = self.request.query_params.get('follower')
        followed = self.request.query_params.get('followed')
        if follower: qs = qs.filter(follower_id=follower)
        if followed: qs = qs.filter(followed_id=followed)
        return qs

class FollowDetailView(generics.RetrieveDestroyAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer


# ── Direct Messaging ──────────────────────────────────────────────
class DirectMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = DirectMessageSerializer

    def get_queryset(self):
        qs = DirectMessage.objects.all().order_by('created_at')
        u1 = self.request.query_params.get('user1')
        u2 = self.request.query_params.get('user2')
        if u1 and u2:
            qs = qs.filter(
                (Q(sender_id=u1) & Q(receiver_id=u2)) |
                (Q(sender_id=u2) & Q(receiver_id=u1))
            )
        return qs

    def perform_create(self, serializer):
        msg = serializer.save()
        
        # notify receiver instantly
        notif = Notification.objects.create(
            recipient=msg.receiver,
            notif_type='message',
            title=f"New msg from {msg.sender.name}",
            body=msg.content[:50] + ('...' if len(msg.content) > 50 else ''),
            from_user=msg.sender,
            meta_data={'message_id': msg.id}
        )
        push_notification(msg.receiver_id, {
            'type': 'new_message',
            'message': DirectMessageSerializer(msg).data
        })
        push_notification(msg.receiver_id, {
            'type': 'notification',
            'notification': NotificationSerializer(notif).data,
        })

# ── Reviews ───────────────────────────────────────────────────────
class ReviewListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/connect/reviews/?user=<id>
    POST /api/connect/reviews/
    """
    serializer_class = ReviewSerializer

    def get_queryset(self):
        qs = Review.objects.select_related('reviewer', 'reviewed')
        user = self.request.query_params.get('user')
        if user:
            qs = qs.filter(reviewed_id=user)
        return qs

    def perform_create(self, serializer):
        review = serializer.save()
        # Recalculate rating for the reviewed user
        reviewed = review.reviewed
        all_reviews = Review.objects.filter(reviewed=reviewed)
        if all_reviews.exists():
            avg = sum(r.rating for r in all_reviews) / all_reviews.count()
            reviewed.rating = round(avg, 1)
            reviewed.review_count = all_reviews.count()
            reviewed.save()
        # Notify reviewed user
        notif = Notification.objects.create(
            recipient=reviewed,
            notif_type='general',
            title=f"New review from {review.reviewer.name}",
            body=f"⭐ {review.rating}/5 — {review.comment or 'No comment.'}",
            from_user=review.reviewer,
        )
        push_notification(reviewed.id, {
            'type': 'notification',
            'notification': NotificationSerializer(notif).data,
        })


# ── Notifications ─────────────────────────────────────────────────
class NotificationListView(generics.ListAPIView):
    """GET /api/connect/notifications/?user=<id>&unread=true"""
    serializer_class = NotificationSerializer

    def get_queryset(self):
        qs = Notification.objects.all()
        user   = self.request.query_params.get('user')
        unread = self.request.query_params.get('unread')
        if user:   qs = qs.filter(recipient_id=user)
        if unread == 'true': qs = qs.filter(is_read=False)
        return qs


class NotificationMarkReadView(APIView):
    """POST /api/connect/notifications/mark-read/  body: {user_id, all: true/false, notif_id}"""
    def post(self, request):
        user_id = request.data.get('user_id')
        all_flag = request.data.get('all', False)
        notif_id = request.data.get('notif_id')
        if all_flag and user_id:
            Notification.objects.filter(recipient_id=user_id, is_read=False).update(is_read=True)
            return Response({'marked': 'all'})
        if notif_id:
            Notification.objects.filter(id=notif_id).update(is_read=True)
            return Response({'marked': notif_id})
        return Response({'error': 'Provide user_id+all or notif_id'}, status=400)


class SendNotificationView(APIView):
    """POST /api/connect/notifications/send/ — push a custom notification"""
    def post(self, request):
        recipient_id = request.data.get('recipient_id')
        notif_type   = request.data.get('notif_type', 'general')
        title        = request.data.get('title', '')
        body         = request.data.get('body', '')
        from_user_id = request.data.get('from_user_id')
        meta         = request.data.get('meta_data', {})

        try:
            recipient = UserProfile.objects.get(id=recipient_id)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=404)

        from_user = None
        if from_user_id:
            try:
                from_user = UserProfile.objects.get(id=from_user_id)
            except UserProfile.DoesNotExist:
                pass

        notif = Notification.objects.create(
            recipient=recipient,
            notif_type=notif_type,
            title=title,
            body=body,
            from_user=from_user,
            meta_data=meta,
        )
        push_notification(recipient_id, {
            'type': 'notification',
            'notification': NotificationSerializer(notif).data,
        })
        return Response(NotificationSerializer(notif).data, status=201)


# ── Rate Board ────────────────────────────────────────────────────
class RateBoardListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/connect/rates/?flower=Rose&action=sell
    POST /api/connect/rates/
    """
    serializer_class = RateBoardSerializer

    def get_queryset(self):
        qs = RateBoard.objects.filter(is_active=True).select_related('user')
        flower = self.request.query_params.get('flower', '')
        action = self.request.query_params.get('action', '')
        role   = self.request.query_params.get('role', '')
        if flower: qs = qs.filter(flower_type__icontains=flower)
        if action: qs = qs.filter(action=action)
        if role:   qs = qs.filter(user__role=role)
        return qs

    def perform_create(self, serializer):
        rb = serializer.save()
        # Notify all connected users about new rate posting
        # (simplified: push to all SSE subscribers)
        event_data = {
            'type': 'rate_update',
            'rate': RateBoardSerializer(rb).data,
        }
        with _notif_lock:
            for uid, queues in _notif_subscribers.items():
                for q in queues:
                    try:
                        q.put_nowait(event_data)
                    except Exception:
                        pass


class RateBoardDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/connect/rates/<id>/"""
    queryset = RateBoard.objects.all()
    serializer_class = RateBoardSerializer


# ── SSE: Real-time notification stream ────────────────────────────
class NotificationSSEView(APIView):
    """
    GET /api/connect/live/<user_id>/
    Server-Sent Events stream for real-time notifications.
    """

    def get(self, request, user_id):
        q = queue.Queue(maxsize=50)
        with _notif_lock:
            _notif_subscribers.setdefault(user_id, []).append(q)

        unread_count = Notification.objects.filter(recipient_id=user_id, is_read=False).count()

        def event_stream():
            try:
                # Send initial state
                yield f"data: {json.dumps({'type':'connected','user_id':user_id,'unread':unread_count})}\n\n"
                while True:
                    try:
                        data = q.get(timeout=25)
                        yield f"data: {json.dumps(data)}\n\n"
                    except queue.Empty:
                        yield f"data: {json.dumps({'type':'heartbeat'})}\n\n"
            finally:
                with _notif_lock:
                    try:
                        _notif_subscribers.get(user_id, []).remove(q)
                    except ValueError:
                        pass

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        response['Access-Control-Allow-Origin'] = '*'
        return response
