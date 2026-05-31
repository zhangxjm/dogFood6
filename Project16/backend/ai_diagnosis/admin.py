from django.contrib import admin
from .models import DiagnosisResult, DiseasePrediction


class DiseasePredictionInline(admin.TabularInline):
    model = DiseasePrediction
    extra = 0


@admin.register(DiagnosisResult)
class DiagnosisResultAdmin(admin.ModelAdmin):
    list_display = ('record', 'top_disease_name', 'confidence', 'severity_level', 'doctor_reviewed', 'created_at')
    list_filter = ('severity_level', 'doctor_reviewed', 'created_at')
    search_fields = ('record__pet__name', 'top_disease_name')
    inlines = [DiseasePredictionInline]


@admin.register(DiseasePrediction)
class DiseasePredictionAdmin(admin.ModelAdmin):
    list_display = ('diagnosis', 'disease_name', 'confidence')
    list_filter = ('disease_code',)
    search_fields = ('disease_name',)
