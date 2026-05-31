from rest_framework import serializers
from .models import Pet, BehaviorType, VideoUpload, BehaviorAnalysis, TrainingPlan, TrainingStep, TrainingProgress


class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = '__all__'


class BehaviorTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BehaviorType
        fields = '__all__'


class VideoUploadSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source='pet.name', read_only=True)

    class Meta:
        model = VideoUpload
        fields = '__all__'
        read_only_fields = ['minio_object_name', 'upload_time', 'status']


class BehaviorAnalysisSerializer(serializers.ModelSerializer):
    behavior_name = serializers.CharField(source='behavior_type.name', read_only=True)
    is_negative = serializers.BooleanField(source='behavior_type.is_negative', read_only=True)

    class Meta:
        model = BehaviorAnalysis
        fields = '__all__'


class TrainingStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingStep
        fields = '__all__'


class TrainingPlanSerializer(serializers.ModelSerializer):
    steps = TrainingStepSerializer(many=True, read_only=True)
    pet_name = serializers.CharField(source='pet.name', read_only=True)

    class Meta:
        model = TrainingPlan
        fields = '__all__'


class TrainingProgressSerializer(serializers.ModelSerializer):
    step_title = serializers.CharField(source='step.title', read_only=True)

    class Meta:
        model = TrainingProgress
        fields = '__all__'


class BehaviorAnalysisCreateSerializer(serializers.Serializer):
    video_id = serializers.IntegerField()
    behavior_code = serializers.CharField()
    confidence = serializers.FloatField()
    start_time = serializers.FloatField()
    end_time = serializers.FloatField()


class TrainingRecommendationSerializer(serializers.Serializer):
    pet_id = serializers.IntegerField()
