from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from .models import News
from .serializers import NewsSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class NewsListCreateAPIView(generics.ListCreateAPIView):
    queryset = News.objects.all().order_by('-created_at')
    serializer_class = NewsSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]
    
class NewsDeleteAPIView(generics.DestroyAPIView):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        print(f"Admin User: {request.user.is_superuser}")  # Log สิทธิ์ Admin
        return super().delete(request, *args, **kwargs)

class PublicNewsListView(APIView):
    permission_classes = [AllowAny]  # ใครก็ได้สามารถเข้าถึงได้

    def get(self, request):
        news = News.objects.all().order_by('-created_at')  # เรียงลำดับจากใหม่ไปเก่า
        serializer = NewsSerializer(news, many=True, context={'request': request})
        return Response(serializer.data, status=200)
    
class NewsUpdateAPIView(generics.UpdateAPIView):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [IsAdminUser]  # จำกัดเฉพาะ Admin เท่านั้น

@api_view(['GET'])
def protected_news(request):
    """
    API สำหรับส่งข่าว: 
    - ผู้ใช้ทั่วไป (ไม่ได้ล็อกอิน): ส่งข่าวสาธารณะ
    - ผู้ใช้ที่ล็อกอิน: ส่งข่าวทั้งหมด
    """
    if request.user.is_authenticated:  # ตรวจสอบผู้ใช้ล็อกอิน
        news = News.objects.all().order_by('-created_at')  # ข่าวทั้งหมด
    else:
        news = News.objects.filter(is_public=True).order_by('-created_at')  # ข่าวที่กำหนดเป็นสาธารณะ

    serializer = NewsSerializer(news, many=True, context={'request': request})
    return Response(serializer.data, status=200)

