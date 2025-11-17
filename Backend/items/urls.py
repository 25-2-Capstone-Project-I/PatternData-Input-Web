from django.urls import path
from .views import ProductListCreateView, check_nickname

urlpatterns = [
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/check-nickname/', check_nickname, name='product-check-nickname'),
]
