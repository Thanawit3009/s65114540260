from django.urls import path
from .views import RegisterAPIView, LoginAPIView, UserProfileView

urlpatterns = [
    path('auth/register/', RegisterAPIView.as_view(), name='register'),
    path('auth/login/', LoginAPIView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
