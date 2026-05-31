from django.db import models
from django.contrib.auth.models import User


class UserPreference(models.Model):
    user = models.OneToOneField(User, verbose_name='用户', on_delete=models.CASCADE, related_name='preference')
    category_weights = models.JSONField('分类权重', default=dict)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '用户偏好'
        verbose_name_plural = '用户偏好'

    def __str__(self):
        return f'{self.user.username}的偏好'


class RecommendationLog(models.Model):
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='recommendation_logs')
    product = models.ForeignKey('products.Product', verbose_name='商品', on_delete=models.CASCADE, related_name='recommendation_logs')
    score = models.FloatField('推荐分数')
    reason = models.CharField('推荐原因', max_length=200)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '推荐记录'
        verbose_name_plural = '推荐记录'
        ordering = ['-score']

    def __str__(self):
        return f'推荐 {self.product.name} 给 {self.user.username} (分数:{self.score})'
