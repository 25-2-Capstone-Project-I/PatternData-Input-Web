from django.db import models

# Create your models here.

from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=100, unique=True)       # 사용자 이름
    date = models.DateField()                     # 날짜
    category = models.CharField(max_length=100)   # 물건 카테고리
    description = models.TextField()              # 물건 설명
    barcode = models.CharField(max_length=13)     # 바코드 숫자열(13자리)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.category} ({self.barcode})"
