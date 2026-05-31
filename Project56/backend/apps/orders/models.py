from django.db import models
from django.contrib.auth.models import User


class CartItem(models.Model):
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey('products.Product', verbose_name='商品', on_delete=models.CASCADE)
    customize_order = models.ForeignKey('customize.CustomizeOrder', verbose_name='定制订单', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.IntegerField('数量', default=1)

    class Meta:
        verbose_name = '购物车项'
        verbose_name_plural = '购物车项'

    def __str__(self):
        return f'{self.user.username} - {self.product.name} x{self.quantity}'


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', '待支付'),
        ('paid', '已支付'),
        ('producing', '制作中'),
        ('shipped', '已发货'),
        ('completed', '已完成'),
        ('cancelled', '已取消'),
    ]
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='orders')
    order_no = models.CharField('订单号', max_length=50, unique=True)
    total_amount = models.DecimalField('订单金额', max_digits=10, decimal_places=2)
    status = models.CharField('订单状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    address = models.TextField('收货地址')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '订单'
        verbose_name_plural = '订单'
        ordering = ['-created_at']

    def __str__(self):
        return self.order_no


class OrderItem(models.Model):
    order = models.ForeignKey(Order, verbose_name='订单', on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', verbose_name='商品', on_delete=models.CASCADE)
    customize_order = models.ForeignKey('customize.CustomizeOrder', verbose_name='定制订单', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.IntegerField('数量', default=1)
    price = models.DecimalField('成交价', max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = '订单项'
        verbose_name_plural = '订单项'

    def __str__(self):
        return f'{self.order.order_no} - {self.product.name}'
