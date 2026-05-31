from django.contrib import admin
from .models import MemberProfile, CheckIn, MemberTask, UserTask, UserBehavior, ShareRecord


@admin.register(MemberProfile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'level', 'points', 'growth_value', 'invite_code']
    list_filter = ['level']
    search_fields = ['user__username', 'invite_code']


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'check_date', 'points_earned']
    list_filter = ['check_date']


@admin.register(MemberTask)
class MemberTaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'task_type', 'points_reward', 'growth_reward']
    list_filter = ['task_type']


@admin.register(UserTask)
class UserTaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'task', 'is_completed', 'completed_at']
    list_filter = ['is_completed']


@admin.register(UserBehavior)
class UserBehaviorAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'action_type', 'created_at']
    list_filter = ['action_type']


@admin.register(ShareRecord)
class ShareRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'share_type', 'code', 'click_count', 'convert_count']
    search_fields = ['code']
