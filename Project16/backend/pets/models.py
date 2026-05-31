from django.db import models
from django.conf import settings


class Pet(models.Model):
    SPECIES_CHOICES = (
        ('dog', '狗'),
        ('cat', '猫'),
        ('bird', '鸟'),
        ('rabbit', '兔子'),
        ('other', '其他'),
    )

    GENDER_CHOICES = (
        ('male', '公'),
        ('female', '母'),
        ('unknown', '未知'),
    )

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pets')
    name = models.CharField(max_length=100, verbose_name='宠物名称')
    species = models.CharField(max_length=20, choices=SPECIES_CHOICES, verbose_name='物种')
    breed = models.CharField(max_length=100, blank=True, null=True, verbose_name='品种')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unknown', verbose_name='性别')
    age = models.IntegerField(blank=True, null=True, verbose_name='年龄（月')
    weight = models.FloatField(blank=True, null=True, verbose_name='体重（kg）')
    color = models.CharField(max_length=50, blank=True, null=True, verbose_name='毛色')
    description = models.TextField(blank=True, null=True, verbose_name='描述')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'pets'
        verbose_name = '宠物'
        verbose_name_plural = '宠物'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.get_species_display()}'
