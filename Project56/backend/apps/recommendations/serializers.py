from rest_framework import serializers
from apps.products.serializers import ProductListSerializer
from .models import UserPreference, RecommendationLog


class UserPreferenceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserPreference
        fields = ['id', 'user', 'username', 'category_weights', 'updated_at']


class RecommendationLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = RecommendationLog
        fields = ['id', 'user', 'product', 'product_name', 'score', 'reason', 'created_at']
