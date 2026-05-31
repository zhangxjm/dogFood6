from rest_framework.routers import DefaultRouter
from .views import RecommendationViewSet, UserPreferenceViewSet, RecommendationLogViewSet

router = DefaultRouter()
router.register(r'recommend', RecommendationViewSet, basename='recommend')
router.register(r'preferences', UserPreferenceViewSet)
router.register(r'logs', RecommendationLogViewSet)

urlpatterns = router.urls
