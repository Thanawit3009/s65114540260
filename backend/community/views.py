from rest_framework import generics, status
from .models import Post
from .serializers import PostSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

# View สำหรับการสร้างโพสต์
class PostCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # เพิ่มผู้ใช้ที่ล็อกอินเป็นเจ้าของโพสต์
        data = request.data.copy()
        data['user_name'] = request.user.email  # ใช้ email แทน username
        serializer = PostSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(user=request.user)  # ระบุว่าโพสต์นี้เป็นของ user ที่ล็อกอิน
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Validation Errors:", serializer.errors)  # Debug ข้อผิดพลาด
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# View สำหรับแสดงโพสต์ทั้งหมด
class PostListView(APIView):
    # เปลี่ยนเป็น AllowAny เพื่อให้ทุกคนเข้าถึงได้
    permission_classes = [AllowAny]

    def get(self, request):
        posts = Post.objects.all().order_by('-created_at')  # เรียงลำดับโพสต์จากใหม่ไปเก่า
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class PublicPostListView(APIView):
    permission_classes = [AllowAny]  # อนุญาตให้ทุกคนเข้าถึงได้
    def get(self, request):
        # ดึงเฉพาะโพสต์ที่เป็นสาธารณะ (กรณีคุณมีฟิลด์ที่บอกว่าโพสต์นี้เป็น public หรือไม่)
        public_posts = Post.objects.all()  # สมมติว่าโพสต์ทั้งหมดคือสาธารณะ
        serializer = PostSerializer(public_posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)