from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MemberProfile, CheckIn, MemberTask, UserTask, UserBehavior, ShareRecord


class MemberProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = MemberProfile
        fields = ['id', 'user', 'username', 'email', 'level', 'points', 'growth_value', 'invite_code', 'inviter']


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ['id', 'user', 'check_date', 'points_earned']
        read_only_fields = ['points_earned']


class MemberTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberTask
        fields = ['id', 'name', 'task_type', 'points_reward', 'growth_reward', 'condition']


class UserTaskSerializer(serializers.ModelSerializer):
    task_name = serializers.CharField(source='task.name', read_only=True)
    task_type = serializers.CharField(source='task.task_type', read_only=True)

    class Meta:
        model = UserTask
        fields = ['id', 'user', 'task', 'task_name', 'task_type', 'is_completed', 'completed_at']


class UserBehaviorSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = UserBehavior
        fields = ['id', 'user', 'product', 'product_name', 'action_type', 'created_at']
        read_only_fields = ['created_at']


class ShareRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareRecord
        fields = ['id', 'user', 'share_type', 'target_id', 'code', 'click_count', 'convert_count']
        read_only_fields = ['code', 'click_count', 'convert_count']
