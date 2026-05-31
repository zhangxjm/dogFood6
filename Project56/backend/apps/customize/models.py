from django.db import models
from django.contrib.auth.models import User


class CustomizeTemplate(models.Model):
    product = models.ForeignKey('products.Product', verbose_name='商品', on_delete=models.CASCADE, related_name='customize_templates')
    name = models.CharField('模板名称', max_length=100)
    config_schema = models.JSONField('配置方案', default=dict)

    class Meta:
        verbose_name = '定制模板'
        verbose_name_plural = '定制模板'

    def __str__(self):
        return f'{self.product.name} - {self.name}'


class CustomizeOrder(models.Model):
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='customize_orders')
    product = models.ForeignKey('products.Product', verbose_name='商品', on_delete=models.CASCADE)
    template = models.ForeignKey(CustomizeTemplate, verbose_name='模板', on_delete=models.CASCADE, related_name='orders')
    config_data = models.JSONField('配置数据', default=dict)
    preview_url = models.CharField('预览地址', max_length=500, null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '定制订单'
        verbose_name_plural = '定制订单'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} 定制 {self.product.name}'
