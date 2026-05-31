from django.contrib import admin
from .models import CustomizeTemplate, CustomizeOrder


@admin.register(CustomizeTemplate)
class CustomizeTemplateAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'name']
    list_filter = ['product']


@admin.register(CustomizeOrder)
class CustomizeOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'template', 'created_at']
    list_filter = ['product']
