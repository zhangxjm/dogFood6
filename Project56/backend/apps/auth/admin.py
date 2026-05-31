from django.contrib import admin
from apps.members.models import MemberProfile, CheckIn, MemberTask, UserTask, UserBehavior, ShareRecord

@admin.register(MemberProfile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'level', 'points', 'invite_code']
