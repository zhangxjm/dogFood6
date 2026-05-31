from django.db import models
from django.utils import timezone


class Program(models.Model):
    STATUS_CHOICES = [
        ('active', '播出中'),
        ('inactive', '停播'),
        ('pending', '待审核'),
    ]

    CATEGORY_CHOICES = [
        ('music', '音乐类'),
        ('news', '新闻类'),
        ('talk', '访谈类'),
        ('story', '故事类'),
        ('education', '教育类'),
        ('entertainment', '娱乐类'),
        ('other', '其他'),
    ]

    name = models.CharField(max_length=100, verbose_name='节目名称')
    host = models.CharField(max_length=50, verbose_name='主持人')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='节目类型')
    description = models.TextField(verbose_name='节目简介')
    duration = models.IntegerField(verbose_name='节目时长(分钟)')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name='状态')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '广播节目'
        verbose_name_plural = '广播节目'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Schedule(models.Model):
    WEEKDAY_CHOICES = [
        (1, '周一'),
        (2, '周二'),
        (3, '周三'),
        (4, '周四'),
        (5, '周五'),
        (6, '周六'),
        (7, '周日'),
    ]

    program = models.ForeignKey(Program, on_delete=models.CASCADE, verbose_name='节目')
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES, verbose_name='星期')
    start_time = models.TimeField(verbose_name='开始时间')
    end_time = models.TimeField(verbose_name='结束时间')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '播放排班'
        verbose_name_plural = '播放排班'
        ordering = ['weekday', 'start_time']

    def __str__(self):
        return f'{self.program.name} - {self.get_weekday_display()} {self.start_time}'


class PlayRecord(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, verbose_name='节目')
    schedule = models.ForeignKey(Schedule, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='对应排班')
    play_date = models.DateField(verbose_name='播放日期')
    start_time = models.TimeField(verbose_name='实际开始时间')
    end_time = models.TimeField(verbose_name='实际结束时间')
    host = models.CharField(max_length=50, verbose_name='实际主持人')
    listeners_count = models.IntegerField(default=0, verbose_name='听众人数')
    remarks = models.TextField(blank=True, verbose_name='备注')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='记录时间')

    class Meta:
        verbose_name = '播放记录'
        verbose_name_plural = '播放记录'
        ordering = ['-play_date', '-start_time']

    def __str__(self):
        return f'{self.program.name} - {self.play_date}'


class Submission(models.Model):
    STATUS_CHOICES = [
        ('pending', '待审核'),
        ('approved', '已通过'),
        ('rejected', '已拒绝'),
        ('broadcast', '已播出'),
    ]

    TYPE_CHOICES = [
        ('song', '歌曲点播'),
        ('article', '文章投稿'),
        ('story', '故事投稿'),
        ('blessing', '祝福语'),
        ('other', '其他'),
    ]

    title = models.CharField(max_length=100, verbose_name='标题')
    submitter_name = models.CharField(max_length=50, verbose_name='投稿人姓名')
    submitter_class = models.CharField(max_length=50, blank=True, verbose_name='投稿人班级')
    submission_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name='投稿类型')
    content = models.TextField(verbose_name='内容')
    contact = models.CharField(max_length=50, blank=True, verbose_name='联系方式')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='审核状态')
    review_remark = models.TextField(blank=True, verbose_name='审核备注')
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='投稿时间')
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='审核时间')

    class Meta:
        verbose_name = '投稿信息'
        verbose_name_plural = '投稿信息'
        ordering = ['-submitted_at']

    def __str__(self):
        return self.title
