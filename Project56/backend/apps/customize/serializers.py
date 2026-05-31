from rest_framework import serializers
from .models import CustomizeTemplate, CustomizeOrder


class CustomizeTemplateSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = CustomizeTemplate
        fields = ['id', 'product', 'product_name', 'name', 'config_schema']


class CustomizeOrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)

    class Meta:
        model = CustomizeOrder
        fields = ['id', 'user', 'product', 'product_name', 'template', 'template_name', 'config_data', 'preview_url', 'created_at']
        read_only_fields = ['preview_url']
