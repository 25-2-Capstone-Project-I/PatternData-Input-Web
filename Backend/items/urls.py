from django.urls import path
from .views import ProductListCreateView, check_name

urlpatterns = [
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/check-name/', check_name, name='product-check-name'),
]
