from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.conf import settings
from django.core.files import File

import os

from .models import Product
from .serializers import ProductSerializer
from items.pattern_logic.barcode_pattern import BarcodePatternGenerator


# 1) 기본 Product 리스트 조회 + 생성 (GET / POST /api/products/)
class ProductListCreateView(generics.ListCreateAPIView):
    # 최신순으로 정렬
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer


# 2) 닉네임 중복 확인 (GET /api/products/check-nickname/?nickname=...)
@api_view(['GET'])
def check_nickname(request):
    nickname = request.query_params.get('nickname', '').strip()
    exists = Product.objects.filter(nickname=nickname).exists()
    return Response({'exists': exists})


# 3) 패턴 생성까지 같이 처리하는 엔드포인트
#    (POST /api/products/create-with-pattern/)
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
    image_file = request.FILES.get('image')  # FormData에서 'image'로 들어오는 파일

    # 필수 값 체크
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

    # 12) 패턴 템플릿 PNG가 들어있는 폴더 (mnt_project)
    pattern_dir = os.path.join(
        settings.BASE_DIR,
        "items",
        "pattern_logic",
        "mnt_project",
    )

    # 3) 결과 패턴 이미지가 저장될 폴더
    output_dir = os.path.join(
        settings.BASE_DIR,
        "pattern_outputs",
    )
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
        # 패턴 생성 실패 시
        return Response(
            {"detail": f"패턴 생성 중 오류가 발생했습니다: {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # 3) pattern_image 필드에 저장 (ImageField 또는 FileField라고 가정)
    with open(pattern_path, 'rb') as f:
        filename = os.path.basename(pattern_path)
        product.pattern_image.save(filename, File(f), save=True)

    # 4) 응답: 프론트에서 바로 이미지 쓸 수 있도록 URL 반환
    return Response(
        {
            "id": product.id,
            "pattern_image_url": product.pattern_image.url,
        },
        status=status.HTTP_201_CREATED,
    )
