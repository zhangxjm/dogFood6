from rest_framework.routers import DefaultRouter
from .views import CouponViewSet, UserCouponViewSet, CampaignViewSet, GroupBuyViewSet

router = DefaultRouter()
router.register(r'coupons', CouponViewSet)
router.register(r'user-coupons', UserCouponViewSet)
router.register(r'campaigns', CampaignViewSet)
router.register(r'group-buys', GroupBuyViewSet)

urlpatterns = router.urls
