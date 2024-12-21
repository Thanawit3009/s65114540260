from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer

User = get_user_model()  # ใช้ CustomUser แทน auth.User

class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        phone_number = request.data.get('phone_number')  # เพิ่มการดึงข้อมูล phone_number
        email = request.data.get('email')
        password = request.data.get('password')

        # ตรวจสอบข้อมูลที่จำเป็น
        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # ตรวจสอบว่ามี email ซ้ำหรือไม่
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists!'}, status=status.HTTP_400_BAD_REQUEST)

        # สร้างผู้ใช้ใหม่และบันทึกเบอร์โทรศัพท์
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        user.phone_number = phone_number  # บันทึกเบอร์โทรศัพท์
        user.save()

        return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)

    
class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(username=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'is_admin': user.is_superuser  # ส่งสถานะ is_superuser กลับมาด้วย
            }, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    profile_data = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "date_joined": user.date_joined,
    }
    return Response(profile_data)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]  # เฉพาะผู้ที่ล็อกอินเท่านั้น

    def get(self, request):
        user = request.user  # ดึงข้อมูลผู้ใช้จาก Token
        serializer = UserSerializer(user)
        return Response(serializer.data, status=200)