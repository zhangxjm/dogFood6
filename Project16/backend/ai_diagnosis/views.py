from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import DiagnosisResult, DiseasePrediction
from .serializers import DiagnosisResultSerializer
from .ai_model import diagnose_xray
from medical_records.models import MedicalImage, MedicalRecord
from medical_records.encryption import decrypt_image


class DiagnosisListCreateView(generics.ListAPIView):
    serializer_class = DiagnosisResultSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return DiagnosisResult.objects.filter(record__pet__owner=self.request.user)


class DiagnosisRetrieveView(generics.RetrieveAPIView):
    serializer_class = DiagnosisResultSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return DiagnosisResult.objects.filter(record__pet__owner=self.request.user)


class PerformDiagnosisView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, record_id):
        try:
            record = MedicalRecord.objects.get(id=record_id, pet__owner=request.user)
        except MedicalRecord.DoesNotExist:
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)

        image = record.images.first()
        if not image:
            return Response({'error': 'No image found for this record'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with open(image.encrypted_file.path, 'rb') as f:
                encrypted_data = f.read()
            image_data = decrypt_image(encrypted_data)
        except Exception as e:
            return Response({'error': f'Failed to load image: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        diagnosis_result = diagnose_xray(image_data)

        if diagnosis_result is None:
            return Response({'error': 'Failed to analyze image'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        diagnosis = DiagnosisResult.objects.create(
            record=record,
            image=image,
            top_disease=diagnosis_result['top_prediction']['disease'],
            top_disease_name=diagnosis_result['top_prediction']['disease_name'],
            confidence=diagnosis_result['top_prediction']['confidence'],
            severity_level=diagnosis_result['severity']['level'],
            severity_color=diagnosis_result['severity']['color'],
            ai_report=diagnosis_result['top_prediction']['description'],
            recommendations='\n'.join(diagnosis_result['recommendation'])
        )

        for pred in diagnosis_result['predictions']:
            DiseasePrediction.objects.create(
                diagnosis=diagnosis,
                disease_code=pred['disease'],
                disease_name=pred['disease_name'],
                confidence=pred['confidence'],
                description=pred['description']
            )

        record.status = 'diagnosed'
        record.save()

        serializer = DiagnosisResultSerializer(diagnosis, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReviewDiagnosisView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, diagnosis_id):
        try:
            diagnosis = DiagnosisResult.objects.get(
                id=diagnosis_id,
                record__pet__owner=request.user
            )
        except DiagnosisResult.DoesNotExist:
            return Response({'error': 'Diagnosis not found'}, status=status.HTTP_404_NOT_FOUND)

        diagnosis.doctor_reviewed = True
        diagnosis.reviewed_by = request.user
        diagnosis.reviewed_at = timezone.now()
        diagnosis.save()

        diagnosis.record.status = 'confirmed'
        diagnosis.record.save()

        serializer = DiagnosisResultSerializer(diagnosis, context={'request': request})
        return Response(serializer.data)


class DiagnosisStatsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        from django.db.models import Count

        diagnoses = DiagnosisResult.objects.filter(record__pet__owner=request.user)

        total = diagnoses.count()
        by_severity = diagnoses.values('severity_level').annotate(count=Count('id'))
        by_disease = diagnoses.values('top_disease_name').annotate(count=Count('id')).order_by('-count')[:5]
        pending_review = diagnoses.filter(doctor_reviewed=False).count()

        return Response({
            'total_diagnoses': total,
            'by_severity': list(by_severity),
            'top_diseases': list(by_disease),
            'pending_review': pending_review
        })
