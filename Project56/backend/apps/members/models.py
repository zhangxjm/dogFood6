from django.db import models
from django.contrib.auth.models import User


class MemberProfile(models.Model):
    user = models.OneToOneField(User, verbose_name='用户', on_delete=models.CASCADE, related_name='profile')
    level = models.IntegerField('会员等级', default=1)
    points = models.IntegerField('积分', default=0)
    growth_value = models.IntegerField('成长值', default=0)
    invite_code = models.CharField('邀请码', max_length=20, unique=True)
    inviter = models.ForeignKey('self', verbose_name='邀请人', on_delete=models.SET_NULL, null=True, blank=True, related_name='invitees')

    class Meta:
        verbose_name = '会员档案'
        verbose_name_plural = '会员档案'

    def __str__(self):
        return f'{self.user.username}的会员档案'


class CheckIn(models.Model):
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='checkins')
    check_date = models.DateField('签到日期')
    points_earned = models.IntegerField('获得积分', default=10)

    class Meta:
        verbose_name = '签到记录'
        verbose_name_plural = '签到记录'
        unique_together = ['user', 'check_date']

    def __str__(self):
        return f'{self.user.username} {self.check_date}'


class MemberTask(models.Model):
    TASK_TYPE_CHOICES = [
        ('checkin', '签到'),
        ('share', '分享'),
        ('consume', '消费'),
    ]
    name = models.CharField('任务名称', max_length=100)
    task_type = models.CharField('任务类型', max_length=20, choices=TASK_TYPE_CHOICES)
    points_reward = models.IntegerField('积分奖励', default=0)
    growth_reward = models.IntegerField('成长值奖励', default=0)
    condition = models.JSONField('任务条件', default=dict)

    class Meta:
        verbose_name = '会员任务'
        verbose_name_plural = '会员任务'

    def __str__(self):
        return self.name


class UserTask(models.Model):
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='user_tasks')
    task = models.ForeignKey(MemberTask, verbose_name='任务', on_delete=models.CASCADE, related_name='user_tasks')
    is_completed = models.BooleanField('是否完成', default=False)
    completed_at = models.DateTimeField('完成时间', null=True, blank=True)

    class Meta:
        verbose_name = '用户任务'
        verbose_name_plural = '用户任务'
        unique_together = ['user', 'task']

    def __str__(self):
        return f'{self.user.username} - {self.task.name}'


class UserBehavior(models.Model):
    ACTION_TYPE_CHOICES = [
        ('browse', '浏览'),
        ('favorite', '收藏'),
        ('purchase', '购买'),
    ]
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='behaviors')
    product = models.ForeignKey('products.Product', verbose_name='商品', on_delete=models.CASCADE, related_name='behaviors')
    action_type = models.CharField('行为类型', max_length=20, choices=ACTION_TYPE_CHOICES)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '用户行为'
        verbose_name_plural = '用户行为'

    def __str__(self):
        return f'{self.user.username} {self.get_action_type_display()} {self.product.name}'


class ShareRecord(models.Model):
    user = models.ForeignKey(User, verbose_name='用户', on_delete=models.CASCADE, related_name='share_records')
    share_type = models.CharField('分享类型', max_length=50)
    target_id = models.IntegerField('目标ID')
    code = models.CharField('分享码', max_length=50, unique=True)
    click_count = models.IntegerField('点击次数', default=0)
    convert_count = models.IntegerField('转化次数', default=0)

    class Meta:
        verbose_name = '分享记录'
        verbose_name_plural = '分享记录'

    def __str__(self):
        return f'{self.user.username} 分享 {self.share_type}'
