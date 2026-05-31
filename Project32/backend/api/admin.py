from django.contrib import admin
from .models import Pet, BehaviorType, VideoUpload, BehaviorAnalysis, TrainingPlan, TrainingStep, TrainingProgress


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ['name', 'species', 'breed', 'age', 'weight', 'created_at']
    list_filter = ['species', 'breed']
    search_fields = ['name', 'breed']


@admin.register(BehaviorType)
class BehaviorTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_negative', 'severity_level']
    list_filter = ['is_negative', 'severity_level']
    search_fields = ['name', 'code']


@admin.register(VideoUpload)
class VideoUploadAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'pet', 'upload_time', 'status', 'file_size']
    list_filter = ['status', 'upload_time']
    search_fields = ['file_name', 'pet__name']


@admin.register(BehaviorAnalysis)
class BehaviorAnalysisAdmin(admin.ModelAdmin):
    list_display = ['video', 'behavior_type', 'confidence', 'start_time', 'end_time']
    list_filter = ['behavior_type', 'analyzed_at']
    search_fields = ['video__file_name', 'behavior_type__name']


@admin.register(TrainingPlan)
class TrainingPlanAdmin(admin.ModelAdmin):
    list_display = ['title', 'pet', 'duration_days', 'difficulty_level', 'is_active', 'created_at']
    list_filter = ['is_active', 'difficulty_level', 'created_at']
    search_fields = ['title', 'pet__name']


@admin.register(TrainingStep)
class TrainingStepAdmin(admin.ModelAdmin):
    list_display = ['plan', 'order', 'title', 'expected_duration']
    list_filter = ['plan']
    search_fields = ['title', 'plan__title']


@admin.register(TrainingProgress)
class TrainingProgressAdmin(admin.ModelAdmin):
    list_display = ['plan', 'step', 'completed_date', 'success_rate']
    list_filter = ['completed_date', 'success_rate']
    search_fields = ['plan__title', 'step__title']
