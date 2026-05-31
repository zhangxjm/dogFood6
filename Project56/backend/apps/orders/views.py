import uuid
from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CartItem, Order, OrderItem
from .serializers import CartItemSerializer, OrderSerializer, OrderCreateSerializer


class CartViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.none()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='update-quantity')
    def update_quantity(self, request, pk=None):
        cart_item = self.get_object()
        quantity = request.data.get('quantity', 1)
        cart_item.quantity = quantity
        cart_item.save()
        return Response(CartItemSerializer(cart_item).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.none()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart_items = CartItem.objects.filter(
            id__in=serializer.validated_data['cart_item_ids'],
            user=request.user
        )
        if not cart_items.exists():
            return Response({'detail': '购物车为空'}, status=status.HTTP_400_BAD_REQUEST)
        total_amount = Decimal('0')
        order_items_data = []
        for item in cart_items:
            item_total = item.product.price * item.quantity
            total_amount += item_total
            order_items_data.append({
                'product': item.product,
                'customize_order': item.customize_order,
                'quantity': item.quantity,
                'price': item.product.price,
            })
        order = Order.objects.create(
            user=request.user,
            order_no=uuid.uuid4().hex[:16].upper(),
            total_amount=total_amount,
            address=serializer.validated_data['address'],
        )
        for data in order_items_data:
            OrderItem.objects.create(order=order, **data)
        cart_items.delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status not in ['pending', 'paid']:
            return Response({'detail': '订单状态不允许取消'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'cancelled'
        order.save()
        return Response(OrderSerializer(order).data)
