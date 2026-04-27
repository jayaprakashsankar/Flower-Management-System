from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Member
from .serializers import MemberSerializer


class MemberListCreateView(generics.ListCreateAPIView):
    """GET /api/members/  POST /api/members/"""
    serializer_class = MemberSerializer

    def get_queryset(self):
        qs = Member.objects.all()
        stat = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        if stat:
            qs = qs.filter(status=stat)
        if search:
            qs = qs.filter(Q(store_name__icontains=search) | Q(owner_name__icontains=search) | Q(phone__icontains=search))
        return qs


class MemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/members/<id>/"""
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
