from django.urls import path
from .views import NewsListCreateAPIView, NewsDeleteAPIView, NewsUpdateAPIView, PublicNewsListView, protected_news

urlpatterns = [
    path('', NewsListCreateAPIView.as_view(), name='news-list-create'),  # แสดงและสร้างข่าว
    path('<int:pk>/', NewsUpdateAPIView.as_view(), name='news-update'),  # แก้ไขข่าว
    path('<int:pk>/delete/', NewsDeleteAPIView.as_view(), name='news-delete'),
    path('public/', PublicNewsListView.as_view(), name='public-news-list'),  # แสดงข่าวสำหรับสาธารณะ
    path('protected/', protected_news, name='protected-news'),  # เส้นทางนี้ถูกต้อง
]
