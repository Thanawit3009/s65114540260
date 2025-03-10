from django.urls import path
from .views import PostListView, PostCreateView, PublicPostListView, CommentListView, CommentReplyView, ReviewView, LikePostView, DashboardOverviewView

urlpatterns = [
    path('posts/create/', PostCreateView.as_view(), name='post-create'),
    path('posts/', PostListView.as_view(), name='post-list'),
    path('posts/public/', PublicPostListView.as_view(), name='public-post-list'),
    path('posts/<int:post_id>/comments/', CommentListView.as_view(), name='comments'),
    # ปรับ URL ให้เชื่อมโยงกับ post_id
    path('posts/<int:post_id>/comments/<int:comment_id>/replies/', CommentReplyView.as_view(), name='comment-replies'),
    path('reviews/<int:user_id>/', ReviewView.as_view(), name='reviews'),  # รองรับ GET และ POST
    path('posts/<int:post_id>/like/', LikePostView.as_view(), name='post-like'),
    path('dashboard/overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
]
