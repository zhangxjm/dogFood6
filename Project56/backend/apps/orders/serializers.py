from rest_framework import serializers
from .models import CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'user', 'product', 'product_name', 'product_price', 'product_image', 'customize_order', 'quantity']


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'customize_order', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'order_no', 'total_amount', 'status', 'status_display', 'address', 'items', 'created_at', 'updated_at']
        read_only_fields = ['order_no', 'status']


class OrderCreateSerializer(serializers.Serializer):
    address = serializers.CharField()
    cart_item_ids = serializers.ListField(child=serializers.IntegerField())
