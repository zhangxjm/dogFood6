from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from apps.products.models import Product, Category
from apps.orders.models import Order
from apps.members.models import MemberProfile


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    total_users = User.objects.count()
    total_products = Product.objects.count()
    total_categories = Category.objects.count()
    total_orders = Order.objects.count()
    recent_orders = Order.objects.order_by('-created_at')[:5]
    orders_data = []
    for o in recent_orders:
        orders_data.append({
            'order_no': o.order_no,
            'user': o.user.username,
            'total_amount': str(o.total_amount),
            'status': o.get_status_display(),
            'created_at': o.created_at.isoformat(),
        })
    return Response({
        'total_users': total_users,
        'total_products': total_products,
        'total_categories': total_categories,
        'total_orders': total_orders,
        'recent_orders': orders_data,
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.auth.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/members/', include('apps.members.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/campaigns/', include('apps.campaigns.urls')),
    path('api/recommendations/', include('apps.recommendations.urls')),
    path('api/customize/', include('apps.customize.urls')),
    path('api/dashboard/stats/', dashboard_stats),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
