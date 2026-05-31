from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('doctor', '医生'),
        ('assistant', '助理'),
        ('admin', '管理员'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='doctor')
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = '用户'

    def __str__(self):
        return f'{self.username} - {self.get_role_display()}'
