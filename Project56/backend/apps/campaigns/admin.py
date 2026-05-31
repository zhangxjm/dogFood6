from django.contrib import admin
from .models import Coupon, UserCoupon, Campaign, GroupBuy, GroupBuyParticipant


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'coupon_type', 'discount', 'min_amount', 'expire_at']
    list_filter = ['coupon_type']


@admin.register(UserCoupon)
class UserCouponAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'coupon', 'is_used', 'used_at']
    list_filter = ['is_used']


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'campaign_type', 'start_at', 'end_at', 'is_active']
    list_filter = ['campaign_type', 'is_active']


@admin.register(GroupBuy)
class GroupBuyAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'group_price', 'target_count', 'current_count']


@admin.register(GroupBuyParticipant)
class GroupBuyParticipantAdmin(admin.ModelAdmin):
    list_display = ['id', 'group_buy', 'user', 'is_leader', 'joined_at']
    list_filter = ['is_leader']
