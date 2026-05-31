from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Coupon, UserCoupon, Campaign, GroupBuy, GroupBuyParticipant
from .serializers import (
    CouponSerializer, UserCouponSerializer, CampaignSerializer,
    GroupBuySerializer, GroupBuyParticipantSerializer
)


class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    @action(detail=True, methods=['post'], url_path='claim', permission_classes=[IsAuthenticated])
    def claim(self, request, pk=None):
        coupon = self.get_object()
        if coupon.expire_at < timezone.now():
            return Response({'detail': '优惠券已过期'}, status=status.HTTP_400_BAD_REQUEST)
        if UserCoupon.objects.filter(user=request.user, coupon=coupon).exists():
            return Response({'detail': '已领取该优惠券'}, status=status.HTTP_400_BAD_REQUEST)
        user_coupon = UserCoupon.objects.create(user=request.user, coupon=coupon)
        return Response(UserCouponSerializer(user_coupon).data, status=status.HTTP_201_CREATED)


class UserCouponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserCoupon.objects.none()
    serializer_class = UserCouponSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserCoupon.objects.filter(user=self.request.user)


class CampaignViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Campaign.objects.none()
    serializer_class = CampaignSerializer

    def get_queryset(self):
        return Campaign.objects.filter(is_active=True, end_at__gte=timezone.now())


class GroupBuyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GroupBuy.objects.all()
    serializer_class = GroupBuySerializer

    @action(detail=True, methods=['post'], url_path='join', permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        group_buy = self.get_object()
        if GroupBuyParticipant.objects.filter(group_buy=group_buy, user=request.user).exists():
            return Response({'detail': '已参与该拼团'}, status=status.HTTP_400_BAD_REQUEST)
        if group_buy.current_count >= group_buy.target_count:
            return Response({'detail': '拼团已满'}, status=status.HTTP_400_BAD_REQUEST)
        is_leader = group_buy.current_count == 0
        GroupBuyParticipant.objects.create(group_buy=group_buy, user=request.user, is_leader=is_leader)
        group_buy.current_count += 1
        group_buy.save()
        return Response(GroupBuySerializer(group_buy).data, status=status.HTTP_201_CREATED)
