from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    UserProfileView,
    UpdateProfileAPIView,
    MemberManagementAPIView,
    MemberDetailAPIView,  # เพิ่ม MemberDetailAPIView
    get_profile,
    VerifyTokenView,
    PasswordResetRequestView, 
    PasswordResetConfirmView
)

urlpatterns = [
    path('auth/register/', RegisterAPIView.as_view(), name='register'),
    path('auth/login/', LoginAPIView.as_view(), name='login'),
    path('auth/user/', get_profile, name='auth-user'),  # เพิ่ม endpoint นี้
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', UpdateProfileAPIView.as_view(), name='profile-update'),
    path('members/', MemberManagementAPIView.as_view(), name='member-management'),
    path('members/<int:pk>/', MemberManagementAPIView.as_view(), name='member-delete'),
    path('member/<int:pk>/', MemberDetailAPIView.as_view(), name='member-detail'),
    path('auth/verify/', VerifyTokenView.as_view(), name='verify-token'),
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("auth/password-reset-confirm/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
