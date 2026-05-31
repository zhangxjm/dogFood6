from rest_framework import serializers
from .models import MedicalRecord, MedicalImage


class MedicalImageSerializer(serializers.ModelSerializer):
    image_type_display = serializers.CharField(source='get_image_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MedicalImage
        fields = ('id', 'image_type', 'image_type_display', 'original_filename',
                  'file_size', 'uploaded_at', 'file_url')
        read_only_fields = ('id', 'uploaded_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request and obj.encrypted_file:
            return request.build_absolute_uri(f'/api/records/images/{obj.id}/decrypt/')
        return None


class MedicalRecordSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    pet_name = serializers.CharField(source='pet.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.username', read_only=True, allow_null=True)
    images = MedicalImageSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'doctor')
