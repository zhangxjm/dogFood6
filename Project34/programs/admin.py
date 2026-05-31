from django.contrib import admin
from .models import Program, Schedule, PlayRecord, Submission


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'host', 'category', 'duration', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('name', 'host', 'description')
    list_per_page = 20


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('program', 'weekday_display', 'start_time', 'end_time', 'is_active')
    list_filter = ('weekday', 'is_active')
    search_fields = ('program__name',)
    list_per_page = 20

    def weekday_display(self, obj):
        return obj.get_weekday_display()
    weekday_display.short_description = '星期'


@admin.register(PlayRecord)
class PlayRecordAdmin(admin.ModelAdmin):
    list_display = ('program', 'play_date', 'start_time', 'end_time', 'host', 'listeners_count')
    list_filter = ('play_date', 'program')
    search_fields = ('program__name', 'host', 'remarks')
    list_per_page = 20
    date_hierarchy = 'play_date'


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('title', 'submitter_name', 'submission_type', 'status', 'submitted_at')
    list_filter = ('status', 'submission_type')
    search_fields = ('title', 'submitter_name', 'content')
    list_per_page = 20
    date_hierarchy = 'submitted_at'
    readonly_fields = ('submitted_at',)
