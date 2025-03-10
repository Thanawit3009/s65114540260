from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/community/', include('community.urls')),  # รวมเส้นทางจากแอป community
    path('api/', include('users.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/news/', include('news.urls')),  # เชื่อมต่อแอป news
    path('api/mycollections/', include('mycollections.urls')),  # เชื่อมต่อ mycollections
    path('api/chat/', include('chat.urls')),
]

# เพิ่มการจัดการไฟล์สื่อ
if settings.DEBUG:  # เพิ่มเฉพาะเมื่อ DEBUG เปิดอยู่
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
