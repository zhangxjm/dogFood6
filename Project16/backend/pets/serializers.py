from rest_framework import serializers
from .models import Pet


class PetSerializer(serializers.ModelSerializer):
    species_display = serializers.CharField(source='get_species_display', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Pet
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'owner')
