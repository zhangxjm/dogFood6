import os
from django.db import models
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from pets.models import Pet


encrypted_storage = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'encrypted'))


def encrypted_upload_path(instance, filename):
    return f'records/{instance.record.id}/{filename}'


class MedicalRecord(models.Model):
    STATUS_CHOICES = (
        ('pending', '待诊断'),
        ('diagnosed', '已诊断'),
        ('confirmed', '已确认'),
        ('archived', '已归档'),
    )

    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='medical_records', verbose_name='宠物')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='records', verbose_name='医生')
    title = models.CharField(max_length=200, verbose_name='诊断标题')
    symptoms = models.TextField(verbose_name='症状描述')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='状态')
    diagnosis = models.TextField(blank=True, null=True, verbose_name='医生诊断')
    treatment = models.TextField(blank=True, null=True, verbose_name='治疗方案')
    notes = models.TextField(blank=True, null=True, verbose_name='备注')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    visit_date = models.DateTimeField(auto_now_add=True, verbose_name='就诊日期')

    class Meta:
        db_table = 'medical_records'
        verbose_name = '医疗记录'
        verbose_name_plural = '医疗记录'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.pet.name} - {self.title}'


class MedicalImage(models.Model):
    IMAGE_TYPE_CHOICES = (
        ('xray', 'X光片'),
        ('ct', 'CT扫描'),
        ('mri', '核磁共振'),
        ('ultrasound', '超声波'),
        ('other', '其他'),
    )

    record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='images', verbose_name='医疗记录')
    image_type = models.CharField(max_length=20, choices=IMAGE_TYPE_CHOICES, default='xray', verbose_name='影像类型')
    encrypted_file = models.FileField(upload_to=encrypted_upload_path, storage=encrypted_storage, verbose_name='加密影像文件')
    original_filename = models.CharField(max_length=255, verbose_name='原始文件名')
    file_size = models.BigIntegerField(default=0, verbose_name='文件大小')
    is_encrypted = models.BooleanField(default=True, verbose_name='是否加密')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='上传时间')

    class Meta:
        db_table = 'medical_images'
        verbose_name = '医疗影像'
        verbose_name_plural = '医疗影像'

    def __str__(self):
        return f'{self.record.pet.name} - {self.get_image_type_display()}'
