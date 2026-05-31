from django.contrib import admin
from .models import UserPreference, RecommendationLog


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'updated_at']


@admin.register(RecommendationLog)
class RecommendationLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'score', 'reason', 'created_at']
    list_filter = ['reason']
