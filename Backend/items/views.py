from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer


@api_view(['GET'])
def check_nickname(request):
    nickname = request.query_params.get('nickname', '')
    exists = Product.objects.filter(nickname=nickname).exists()
    return Response({'exists': exists})
