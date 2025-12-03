# from rest_framework import generics
# from rest_framework.decorators import api_view
# from rest_framework.response import Response

# from rest_framework import generics
# from .models import Product
# from .serializers import ProductSerializer

# class ProductListCreateView(generics.ListCreateAPIView):
#     queryset = Product.objects.all().order_by('-created_at')
#     serializer_class = ProductSerializer


# @api_view(['GET'])
# def check_nickname(request):
#     nickname = request.query_params.get('nickname', '')
#     exists = Product.objects.filter(nickname=nickname).exists()
#     return Response({'exists': exists})
import os
from django.conf import settings
from django.core.files import File
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Product
from items.pattern_logic.barcode_pattern import BarcodePatternGenerator

@api_view(['POST'])
def create_product_with_pattern(request):
    """
    물건 정보 + 바코드 + dominant_color + 사진을 받아
    1) Product 생성
    2) 패턴 PNG 생성
    3) pattern_image에 저장
    4) pattern_image_url을 응답
    """
    item_name = request.data.get('item_name')
    nickname = request.data.get('nickname')
    met_date = request.data.get('met_date')
    farewell_date = request.data.get('farewell_date')
    barcode = request.data.get('barcode')
    dominant_color = request.data.get('dominant_color')
    image_file = request.FILES.get('image')  # FormData에서 'image' 키로 들어오는 파일

    if not all([item_name, nickname, met_date, farewell_date, barcode]):
        return Response(
            {"detail": "필수 값이 누락되었습니다."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 1) Product 기본 정보 저장
    product = Product(
        item_name=item_name,
        nickname=nickname,
        met_date=met_date,
        farewell_date=farewell_date,
        barcode=barcode,
        dominant_color=dominant_color,
    )

    if image_file:
        product.image = image_file

    product.save()

    # 2) 패턴 생성
    pattern_dir = os.path.join(settings.BASE_DIR, 'pattern_src')  # 실제 패턴 PNG들이 있는 폴더
    output_dir = os.path.join(settings.MEDIA_ROOT, 'pattern_outputs')

    os.makedirs(output_dir, exist_ok=True)

    generator = BarcodePatternGenerator(
        pattern_dir=pattern_dir,
        output_dir=output_dir,
    )

    try:
        pattern_path = generator.create_pattern_image(
            barcode=barcode,
            bottom_color_hex=dominant_color,
        )
    except Exception as e:
        # 패턴 생성 실패 시 에러 응답 + 롤백 고려 가능
        return Response(
            {"detail": f"패턴 생성 중 오류가 발생했습니다: {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # 3) pattern_image 필드에 저장
    with open(pattern_path, 'rb') as f:
        filename = os.path.basename(pattern_path)
        product.pattern_image.save(filename, File(f), save=True)

    # 4) 응답
    return Response(
        {
            "id": product.id,
            "pattern_image_url": product.pattern_image.url,
        },
        status=status.HTTP_201_CREATED,
    )
