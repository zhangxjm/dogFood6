from django.urls import path
from .views import (
    MedicalRecordListCreateView,
    MedicalRecordRetrieveUpdateDestroyView,
    MedicalImageUploadView,
    MedicalImageDecryptView,
    MedicalImageListView,
)

urlpatterns = [
    path('', MedicalRecordListCreateView.as_view(), name='record-list-create'),
    path('<int:pk>/', MedicalRecordRetrieveUpdateDestroyView.as_view(), name='record-detail'),
    path('<int:record_id>/images/', MedicalImageListView.as_view(), name='image-list'),
    path('<int:record_id>/images/upload/', MedicalImageUploadView.as_view(), name='image-upload'),
    path('images/<int:image_id>/decrypt/', MedicalImageDecryptView.as_view(), name='image-decrypt'),
]
