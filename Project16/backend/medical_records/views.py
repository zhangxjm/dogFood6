import io
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from .models import MedicalRecord, MedicalImage
from .serializers import MedicalRecordSerializer, MedicalImageSerializer
from .encryption import decrypt_image


class MedicalRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicalRecordSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return MedicalRecord.objects.filter(pet__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)


class MedicalRecordRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicalRecordSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return MedicalRecord.objects.filter(pet__owner=self.request.user)


class MedicalImageUploadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, record_id):
        try:
            record = MedicalRecord.objects.get(id=record_id, pet__owner=request.user)
        except MedicalRecord.DoesNotExist:
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)

        image_type = request.data.get('image_type', 'xray')

        from .encryption import encrypt_image
        file_content = image_file.read()
        encrypted_content = encrypt_image(file_content)

        import tempfile
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(encrypted_content)
        temp_file.close()

        from django.core.files import File
        medical_image = MedicalImage(
            record=record,
            image_type=image_type,
            original_filename=image_file.name,
            file_size=image_file.size
        )

        import os
        filename = f'encrypted_{os.path.splitext(image_file.name)[0]}.bin'
        medical_image.encrypted_file.save(filename, File(open(temp_file.name, 'rb')), save=True)

        os.unlink(temp_file.name)

        serializer = MedicalImageSerializer(medical_image, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MedicalImageDecryptView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, image_id):
        try:
            image = MedicalImage.objects.get(id=image_id, record__pet__owner=request.user)
        except MedicalImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

        with open(image.encrypted_file.path, 'rb') as f:
            encrypted_data = f.read()

        decrypted_data = decrypt_image(encrypted_data)

        content_type = 'image/jpeg'
        if image.original_filename.lower().endswith('.png'):
            content_type = 'image/png'

        response = HttpResponse(decrypted_data, content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{image.original_filename}"'
        return response


class MedicalImageListView(generics.ListAPIView):
    serializer_class = MedicalImageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        record_id = self.kwargs.get('record_id')
        return MedicalImage.objects.filter(record__id=record_id, record__pet__owner=self.request.user)
