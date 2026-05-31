from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'parent']
    list_filter = ['parent']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'price', 'category', 'is_customizable', 'is_active', 'created_at']
    list_filter = ['category', 'is_customizable', 'is_active']
    search_fields = ['name', 'description']
    list_editable = ['is_active']
