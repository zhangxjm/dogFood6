from rest_framework.routers import DefaultRouter
from .views import CustomizeTemplateViewSet, CustomizeOrderViewSet

router = DefaultRouter()
router.register(r'templates', CustomizeTemplateViewSet)
router.register(r'orders', CustomizeOrderViewSet)

urlpatterns = router.urls
