from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'department', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('额外信息', {'fields': ('role', 'phone', 'department')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('额外信息', {'fields': ('role', 'phone', 'department')}),
    )
