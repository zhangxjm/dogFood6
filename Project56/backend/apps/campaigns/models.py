from django.db import models
from django.contrib.auth.models import User


class Coupon(models.Model):
    COUPON_TYPE_CHOICES = [
        ('full_reduction', '满减'),
        ('discount', '折扣'),
        ('free_shipping', '免邮'),
    ]
    name = models.CharField('优惠券名称', max_length=100)
    coupon_type = models.CharField('优惠券类型', max_length=20, choices=COUPON_TYPE_CHOICES)
    discount = models.DecimalField('优惠金额/折扣率', max_digits=5, decimal_places=2)
    min_amount = models.DecimalField('最低消费金额', max_digits=10, decimal_places=2, default=0)
    expire_at = models.DateTimeField('过期时间')

    class Meta:
        verbose_name = '优惠券'
        verbose_name_plural = '优惠券'

    def __str__(self):
        return self.name


class UserCoupon(models.Model):
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='coupons')
    coupon = models.ForeignKey(Coupon, verbose_name='优惠券', on_delete=models.CASCADE, related_name='user_coupons')
    is_used = models.BooleanField('是否已使用', default=False)
    used_at = models.DateTimeField('使用时间', null=True, blank=True)

    class Meta:
        verbose_name = '用户优惠券'
        verbose_name_plural = '用户优惠券'

    def __str__(self):
        return f'{self.user.username} - {self.coupon.name}'


class Campaign(models.Model):
    CAMPAIGN_TYPE_CHOICES = [
        ('flash_sale', '限时优惠'),
        ('new_arrival', '新品首发'),
        ('group_buy', '拼团'),
    ]
    title = models.CharField('活动标题', max_length=200)
    campaign_type = models.CharField('活动类型', max_length=20, choices=CAMPAIGN_TYPE_CHOICES)
    rules = models.JSONField('活动规则', default=dict)
    start_at = models.DateTimeField('开始时间')
    end_at = models.DateTimeField('结束时间')
    is_active = models.BooleanField('是否启用', default=True)

    class Meta:
        verbose_name = '营销活动'
        verbose_name_plural = '营销活动'

    def __str__(self):
        return self.title


class GroupBuy(models.Model):
    campaign = models.ForeignKey(Campaign, verbose_name='活动', on_delete=models.CASCADE, related_name='group_buys')
    product = models.ForeignKey('products.Product', verbose_name='商品', on_delete=models.CASCADE, related_name='group_buys')
    group_price = models.DecimalField('拼团价', max_digits=10, decimal_places=2)
    target_count = models.IntegerField('目标人数')
    current_count = models.IntegerField('当前人数', default=0)

    class Meta:
        verbose_name = '拼团活动'
        verbose_name_plural = '拼团活动'

    def __str__(self):
        return f'{self.product.name} 拼团'


class GroupBuyParticipant(models.Model):
    group_buy = models.ForeignKey(GroupBuy, verbose_name='拼团', on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='group_buy_participations')
    is_leader = models.BooleanField('是否团长', default=False)
    joined_at = models.DateTimeField('加入时间', auto_now_add=True)

    class Meta:
        verbose_name = '拼团参与'
        verbose_name_plural = '拼团参与'

    def __str__(self):
        return f'{self.user.username} 参与 {self.group_buy.product.name} 拼团'
