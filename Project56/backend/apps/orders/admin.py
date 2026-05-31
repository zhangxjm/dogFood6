from django.contrib import admin
from .models import CartItem, Order, OrderItem


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'quantity']
    list_filter = ['user']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'order_no', 'user', 'total_amount', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['order_no']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product', 'quantity', 'price']
