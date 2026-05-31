from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.products.serializers import ProductListSerializer
from .models import UserPreference, RecommendationLog
from .serializers import UserPreferenceSerializer, RecommendationLogSerializer
from .services import RecommendationService


class RecommendationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='personal')
    def personal(self, request):
        products = RecommendationService.get_recommendations(request.user, limit=10)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='similar')
    def similar(self, request):
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({'detail': '请提供product_id参数'}, status=400)
        products = RecommendationService.get_similar_products(int(product_id), limit=6)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class UserPreferenceViewSet(viewsets.ModelViewSet):
    queryset = UserPreference.objects.none()
    serializer_class = UserPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)


class RecommendationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RecommendationLog.objects.none()
    serializer_class = RecommendationLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecommendationLog.objects.filter(user=self.request.user)
