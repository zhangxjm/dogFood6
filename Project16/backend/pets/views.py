from rest_framework import generics, permissions
from .models import Pet
from .serializers import PetSerializer


class PetListCreateView(generics.ListCreateAPIView):
    serializer_class = PetSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Pet.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PetRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PetSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Pet.objects.filter(owner=self.request.user)
