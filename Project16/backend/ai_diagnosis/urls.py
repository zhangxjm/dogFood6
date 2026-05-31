from django.urls import path
from .views import (
    DiagnosisListCreateView,
    DiagnosisRetrieveView,
    PerformDiagnosisView,
    ReviewDiagnosisView,
    DiagnosisStatsView,
)

urlpatterns = [
    path('', DiagnosisListCreateView.as_view(), name='diagnosis-list'),
    path('stats/', DiagnosisStatsView.as_view(), name='diagnosis-stats'),
    path('<int:pk>/', DiagnosisRetrieveView.as_view(), name='diagnosis-detail'),
    path('record/<int:record_id>/diagnose/', PerformDiagnosisView.as_view(), name='perform-diagnosis'),
    path('<int:diagnosis_id>/review/', ReviewDiagnosisView.as_view(), name='review-diagnosis'),
]
