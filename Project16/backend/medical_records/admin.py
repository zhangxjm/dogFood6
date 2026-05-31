from django.contrib import admin
from .models import MedicalRecord, MedicalImage


class MedicalImageInline(admin.TabularInline):
    model = MedicalImage
    extra = 0


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('pet', 'title', 'status', 'doctor', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('pet__name', 'title', 'symptoms')
    inlines = [MedicalImageInline]


@admin.register(MedicalImage)
class MedicalImageAdmin(admin.ModelAdmin):
    list_display = ('record', 'image_type', 'original_filename', 'uploaded_at')
    list_filter = ('image_type', 'uploaded_at')
    search_fields = ('original_filename',)
