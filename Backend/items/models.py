from django.db import models

class Product(models.Model):
    item_name = models.CharField(max_length=100)          # 물건 이름
    nickname = models.CharField(max_length=50, unique=True)  # 닉네임 (중복 불가)
    met_date = models.DateField()                             # 물건과 만난 날짜
    farewell_date = models.DateField()                        # 물건과 헤어지는 날짜
    barcode = models.CharField(max_length = 13)
    
    # 색 추출 기능
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)  # 물건 이미지: 웹캠 캡처 or 파일 업로드 모두 여기로 저장
    dominant_color = models.CharField(max_length=7, blank=True, null=True)  # "#rrggbb"
    palette = models.JSONField(blank=True, null=True)  # ["#rrggbb", "#ddeeff", ...] 형식
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item_name} ({self.nickname}) - {self.barcode}"