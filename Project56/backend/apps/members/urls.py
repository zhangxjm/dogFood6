from rest_framework.routers import DefaultRouter
from .views import MemberProfileViewSet, MemberTaskViewSet, UserBehaviorViewSet, ShareViewSet

router = DefaultRouter()
router.register(r'profiles', MemberProfileViewSet)
router.register(r'tasks', MemberTaskViewSet)
router.register(r'behaviors', UserBehaviorViewSet)
router.register(r'shares', ShareViewSet)

urlpatterns = router.urls
