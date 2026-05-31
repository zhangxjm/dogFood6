from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CustomizeTemplate, CustomizeOrder
from .serializers import CustomizeTemplateSerializer, CustomizeOrderSerializer


class CustomizeTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustomizeTemplate.objects.all()
    serializer_class = CustomizeTemplateSerializer


class CustomizeOrderViewSet(viewsets.ModelViewSet):
    queryset = CustomizeOrder.objects.none()
    serializer_class = CustomizeOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomizeOrder.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='preview')
    def preview(self, request, pk=None):
        customize_order = self.get_object()
        preview_url = f'/media/previews/custom_{customize_order.id}.png'
        customize_order.preview_url = preview_url
        customize_order.save()
        return Response({'preview_url': preview_url})

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
