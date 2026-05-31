from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import Pet, BehaviorType, VideoUpload, BehaviorAnalysis, TrainingPlan, TrainingStep, TrainingProgress
from .serializers import (
    PetSerializer, BehaviorTypeSerializer, VideoUploadSerializer, BehaviorAnalysisSerializer,
    TrainingPlanSerializer, TrainingStepSerializer, TrainingProgressSerializer,
    BehaviorAnalysisCreateSerializer, TrainingRecommendationSerializer
)
from .minio_service import MinioService
from .behavior_analyzer import BehaviorAnalyzer, TrainingRecommender


class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all()
    serializer_class = PetSerializer


class BehaviorTypeViewSet(viewsets.ModelViewSet):
    queryset = BehaviorType.objects.all()
    serializer_class = BehaviorTypeSerializer


class VideoUploadViewSet(viewsets.ModelViewSet):
    queryset = VideoUpload.objects.all()
    serializer_class = VideoUploadSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        pet_id = request.data.get('pet_id')

        if not file or not pet_id:
            return Response(
                {'error': '需要提供文件和宠物ID'},
                status=status.HTTP_400_BAD_REQUEST
            )

        pet = get_object_or_404(Pet, id=pet_id)

        try:
            minio_service = MinioService()
            object_name = minio_service.upload_file(file)

            video = VideoUpload.objects.create(
                pet=pet,
                file_name=file.name,
                minio_object_name=object_name,
                file_size=file.size,
                duration=0,
                status='uploaded'
            )

            serializer = self.get_serializer(video)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'上传失败: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def video_url(self, request, pk=None):
        video = self.get_object()
        try:
            minio_service = MinioService()
            url = minio_service.get_file_url(video.minio_object_name)
            return Response({'url': url})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        video = self.get_object()
        video.status = 'analyzing'
        video.save()

        try:
            analyzer = BehaviorAnalyzer()
            results = analyzer.analyze_video(video.id)

            created_analyses = []
            for result in results:
                behavior_type = get_object_or_404(BehaviorType, code=result['behavior_code'])
                analysis = BehaviorAnalysis.objects.create(
                    video=video,
                    behavior_type=behavior_type,
                    confidence=result['confidence'],
                    start_time=result['start_time'],
                    end_time=result['end_time'],
                    frame_count=int((result['end_time'] - result['start_time']) * 30)
                )
                created_analyses.append(analysis)

            video.status = 'completed'
            video.save()

            serializer = BehaviorAnalysisSerializer(created_analyses, many=True)
            return Response(serializer.data)
        except Exception as e:
            video.status = 'failed'
            video.save()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BehaviorAnalysisViewSet(viewsets.ModelViewSet):
    queryset = BehaviorAnalysis.objects.all()
    serializer_class = BehaviorAnalysisSerializer


class TrainingPlanViewSet(viewsets.ModelViewSet):
    queryset = TrainingPlan.objects.all()
    serializer_class = TrainingPlanSerializer

    @action(detail=False, methods=['post'])
    def recommend(self, request):
        serializer = TrainingRecommendationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pet_id = serializer.validated_data['pet_id']
        pet = get_object_or_404(Pet, id=pet_id)

        recent_analyses = BehaviorAnalysis.objects.filter(
            video__pet_id=pet_id
        ).select_related('behavior_type').order_by('-analyzed_at')[:20]

        behaviors_data = []
        for analysis in recent_analyses:
            behaviors_data.append({
                'code': analysis.behavior_type.code,
                'is_negative': analysis.behavior_type.is_negative,
                'severity': analysis.behavior_type.severity_level
            })

        recommender = TrainingRecommender()
        recommendation = recommender.generate_recommendation(pet_id, behaviors_data)

        existing_plan = TrainingPlan.objects.filter(
            pet_id=pet_id,
            title=recommendation['title']
        ).first()

        if existing_plan:
            return Response(TrainingPlanSerializer(existing_plan).data)

        plan = TrainingPlan.objects.create(
            pet=pet,
            title=recommendation['title'],
            description=recommendation['description'],
            duration_days=recommendation['duration_days'],
            difficulty_level=recommendation['difficulty']
        )

        for code in recommendation['target_codes']:
            try:
                behavior = BehaviorType.objects.get(code=code)
                plan.target_behaviors.add(behavior)
            except BehaviorType.DoesNotExist:
                pass

        for step_data in recommendation['steps']:
            TrainingStep.objects.create(
                plan=plan,
                order=step_data['order'],
                title=step_data['title'],
                instruction=step_data['instruction'],
                expected_duration=step_data['duration'],
                tips=step_data.get('tips', '')
            )

        return Response(TrainingPlanSerializer(plan).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def complete_step(self, request, pk=None):
        plan = self.get_object()
        step_id = request.data.get('step_id')
        success_rate = request.data.get('success_rate', 0)
        notes = request.data.get('notes', '')

        step = get_object_or_404(TrainingStep, id=step_id, plan=plan)

        progress = TrainingProgress.objects.create(
            plan=plan,
            step=step,
            success_rate=success_rate,
            notes=notes
        )

        return Response(TrainingProgressSerializer(progress).data)


class TrainingStepViewSet(viewsets.ModelViewSet):
    queryset = TrainingStep.objects.all()
    serializer_class = TrainingStepSerializer


class TrainingProgressViewSet(viewsets.ModelViewSet):
    queryset = TrainingProgress.objects.all()
    serializer_class = TrainingProgressSerializer


@api_view(['GET'])
def dashboard_stats(request):
    stats = {
        'total_pets': Pet.objects.count(),
        'total_videos': VideoUpload.objects.count(),
        'completed_analyses': VideoUpload.objects.filter(status='completed').count(),
        'active_plans': TrainingPlan.objects.filter(is_active=True).count(),
        'negative_behaviors_detected': BehaviorAnalysis.objects.filter(
            behavior_type__is_negative=True
        ).count(),
        'recent_analyses': BehaviorAnalysisSerializer(
            BehaviorAnalysis.objects.select_related('behavior_type', 'video').order_by('-analyzed_at')[:5],
            many=True
        ).data,
    }
    return Response(stats)
