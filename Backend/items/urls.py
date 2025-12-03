from django.urls import path
from .views import ProductListCreateView, check_nickname, create_product_with_pattern

urlpatterns = [
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/check-nickname/', check_nickname, name='product-check-nickname'),
    path("products/create-with-pattern/", create_product_with_pattern, name="product_create_with_pattern"),

]
