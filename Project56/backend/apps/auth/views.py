import uuid
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from apps.members.models import MemberProfile


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    phone = request.data.get('phone', '')
    invite_code = request.data.get('invite_code', '')
    if not username or not password:
        return Response({'detail': '用户名和密码不能为空'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'detail': '用户名已存在'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, password=password)
    inviter = None
    if invite_code:
        try:
            inviter = MemberProfile.objects.get(invite_code=invite_code)
        except MemberProfile.DoesNotExist:
            pass
    MemberProfile.objects.create(
        user=user,
        invite_code=uuid.uuid4().hex[:10],
        inviter=inviter,
    )
    refresh = RefreshToken.for_user(user)
    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'phone': phone,
            'level': 1,
            'points': 0,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username') or request.data.get('phone', '')
    password = request.data.get('password', '')
    if not username or not password:
        return Response({'detail': '用户名和密码不能为空'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'detail': '用户不存在'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.check_password(password):
        return Response({'detail': '密码错误'}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    profile = MemberProfile.objects.filter(user=user).first()
    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'phone': '',
            'level': profile.level if profile else 1,
            'points': profile.points if profile else 0,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    profile = MemberProfile.objects.filter(user=user).first()
    return Response({
        'id': user.id,
        'username': user.username,
        'phone': '',
        'level': profile.level if profile else 1,
        'points': profile.points if profile else 0,
        'growth_value': profile.growth_value if profile else 0,
        'invite_code': profile.invite_code if profile else '',
    })
