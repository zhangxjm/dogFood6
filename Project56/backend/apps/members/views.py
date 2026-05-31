import uuid
from datetime import date
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import MemberProfile, CheckIn, MemberTask, UserTask, UserBehavior, ShareRecord
from .serializers import (
    MemberProfileSerializer, CheckInSerializer, MemberTaskSerializer,
    UserTaskSerializer, UserBehaviorSerializer, ShareRecordSerializer
)


class MemberProfileViewSet(viewsets.ModelViewSet):
    queryset = MemberProfile.objects.none()
    serializer_class = MemberProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MemberProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='profile')
    def profile(self, request):
        profile = MemberProfile.objects.get(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='checkin')
    def checkin(self, request):
        today = date.today()
        if CheckIn.objects.filter(user=request.user, check_date=today).exists():
            return Response({'detail': '今日已签到'}, status=status.HTTP_400_BAD_REQUEST)
        checkin = CheckIn.objects.create(user=request.user, check_date=today, points_earned=10)
        profile = MemberProfile.objects.get(user=request.user)
        profile.points += 10
        profile.growth_value += 5
        profile.save()
        return Response(CheckInSerializer(checkin).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='tasks')
    def tasks(self, request):
        user_tasks = UserTask.objects.filter(user=request.user)
        serializer = UserTaskSerializer(user_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='points')
    def points(self, request):
        profile = MemberProfile.objects.get(user=request.user)
        return Response({'points': profile.points, 'growth_value': profile.growth_value, 'level': profile.level})


class MemberTaskViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MemberTask.objects.all()
    serializer_class = MemberTaskSerializer


class UserBehaviorViewSet(viewsets.ModelViewSet):
    queryset = UserBehavior.objects.none()
    serializer_class = UserBehaviorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBehavior.objects.filter(user=self.request.user)


class ShareViewSet(viewsets.ModelViewSet):
    queryset = ShareRecord.objects.none()
    serializer_class = ShareRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ShareRecord.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_code(self, request):
        share_type = request.data.get('share_type')
        target_id = request.data.get('target_id')
        code = uuid.uuid4().hex[:8]
        share_record = ShareRecord.objects.create(
            user=request.user,
            share_type=share_type,
            target_id=target_id,
            code=code
        )
        return Response(ShareRecordSerializer(share_record).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='click')
    def track_click(self, request, pk=None):
        share_record = self.get_object()
        share_record.click_count += 1
        share_record.save()
        return Response({'click_count': share_record.click_count})

    @action(detail=True, methods=['post'], url_path='convert')
    def track_convert(self, request, pk=None):
        share_record = self.get_object()
        share_record.convert_count += 1
        share_record.save()
        return Response({'convert_count': share_record.convert_count})
