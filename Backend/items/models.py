from django.db import models

class Product(models.Model):
    item_name = models.CharField(max_length=100)          # 물건 이름
    nickname = models.CharField(max_length=50, unique=True)  # 닉네임 (중복 불가)
    date = models.DateField()                     # 날짜
    category = models.CharField(max_length=100)   # 물건 카테고리
    description = models.TextField()              # 물건 설명
    barcode = models.CharField(max_length=13)     # 바코드 숫자열(13자리)
    created_at = models.DateTimeField(auto_now_add=True)
    
    dominant_color = models.CharField(max_length=7, blank=True, null=True)  # "#rrggbb"
    palette = models.JSONField(blank=True, null=True)  # ["#rrggbb", "#ddeeff", ...] 형식

    image = models.ImageField(
        upload_to='product_images/', blank=True, null=True
    )  # 물건 이미지

    def __str__(self):
        return f"{self.item_name} ({self.nickname}) - {self.barcode}"