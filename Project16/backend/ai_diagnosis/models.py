from django.db import models
from django.conf import settings
from medical_records.models import MedicalImage, MedicalRecord


class DiagnosisResult(models.Model):
    record = models.OneToOneField(MedicalRecord, on_delete=models.CASCADE, related_name='ai_diagnosis', verbose_name='医疗记录')
    image = models.ForeignKey(MedicalImage, on_delete=models.CASCADE, related_name='diagnoses', verbose_name='影像')
    top_disease = models.CharField(max_length=50, verbose_name='主要诊断')
    top_disease_name = models.CharField(max_length=100, verbose_name='主要诊断名称')
    confidence = models.FloatField(verbose_name='置信度')
    severity_level = models.CharField(max_length=20, verbose_name='严重程度')
    severity_color = models.CharField(max_length=20, verbose_name='严重程度颜色')
    ai_report = models.TextField(verbose_name='AI诊断报告')
    recommendations = models.TextField(verbose_name='治疗建议')
    doctor_reviewed = models.BooleanField(default=False, verbose_name='医生已审核')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reviewed_diagnoses',
        verbose_name='审核医生'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='审核时间')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='诊断时间')

    class Meta:
        db_table = 'diagnosis_results'
        verbose_name = '诊断结果'
        verbose_name_plural = '诊断结果'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.record.pet.name} - {self.top_disease_name}'


class DiseasePrediction(models.Model):
    diagnosis = models.ForeignKey(DiagnosisResult, on_delete=models.CASCADE, related_name='predictions', verbose_name='诊断结果')
    disease_code = models.CharField(max_length=50, verbose_name='病症代码')
    disease_name = models.CharField(max_length=100, verbose_name='病症名称')
    confidence = models.FloatField(verbose_name='置信度')
    description = models.TextField(verbose_name='病症描述')

    class Meta:
        db_table = 'disease_predictions'
        verbose_name = '病症预测'
        verbose_name_plural = '病症预测'

    def __str__(self):
        return f'{self.disease_name} - {self.confidence}%'
