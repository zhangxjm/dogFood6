from rest_framework import serializers
from .models import DiagnosisResult, DiseasePrediction


class DiseasePredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseasePrediction
        fields = ('id', 'disease_code', 'disease_name', 'confidence', 'description')


class DiagnosisResultSerializer(serializers.ModelSerializer):
    predictions = DiseasePredictionSerializer(many=True, read_only=True)
    pet_name = serializers.CharField(source='record.pet.name', read_only=True)
    record_title = serializers.CharField(source='record.title', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True, allow_null=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = DiagnosisResult
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'reviewed_at')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(f'/api/records/images/{obj.image.id}/decrypt/')
        return None
