from django.urls import path
from .views import PostListView, PostCreateView, PublicPostListView

urlpatterns = [
    path('posts/create/', PostCreateView.as_view(), name='post-create'),  # สำหรับโพสต์ที่ต้องล็อกอิน
    path('posts/', PostListView.as_view(), name='post-list'),  # สำหรับดึงโพสต์ที่ต้องล็อกอิน
    path('posts/public/', PublicPostListView.as_view(), name='public-post-list'),  # สำหรับโพสต์สาธารณะ
]
