from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'pets', views.PetViewSet)
router.register(r'behavior-types', views.BehaviorTypeViewSet)
router.register(r'videos', views.VideoUploadViewSet)
router.register(r'analyses', views.BehaviorAnalysisViewSet)
router.register(r'training-plans', views.TrainingPlanViewSet)
router.register(r'training-steps', views.TrainingStepViewSet)
router.register(r'training-progress', views.TrainingProgressViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
]
