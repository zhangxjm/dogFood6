from rest_framework import serializers
from .models import Coupon, UserCoupon, Campaign, GroupBuy, GroupBuyParticipant


class CouponSerializer(serializers.ModelSerializer):
    coupon_type_display = serializers.CharField(source='get_coupon_type_display', read_only=True)

    class Meta:
        model = Coupon
        fields = ['id', 'name', 'coupon_type', 'coupon_type_display', 'discount', 'min_amount', 'expire_at']


class UserCouponSerializer(serializers.ModelSerializer):
    coupon = CouponSerializer(read_only=True)

    class Meta:
        model = UserCoupon
        fields = ['id', 'user', 'coupon', 'is_used', 'used_at']


class CampaignSerializer(serializers.ModelSerializer):
    campaign_type_display = serializers.CharField(source='get_campaign_type_display', read_only=True)

    class Meta:
        model = Campaign
        fields = ['id', 'title', 'campaign_type', 'campaign_type_display', 'rules', 'start_at', 'end_at', 'is_active']


class GroupBuySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = GroupBuy
        fields = ['id', 'campaign', 'product', 'product_name', 'group_price', 'target_count', 'current_count']


class GroupBuyParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = GroupBuyParticipant
        fields = ['id', 'group_buy', 'user', 'username', 'is_leader', 'joined_at']
