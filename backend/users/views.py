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
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings

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
                'is_admin': user.is_superuser,
                'user': {  # ✅ เพิ่มข้อมูล user กลับไป
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    profile_data = {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "date_joined": user.date_joined if hasattr(user, 'date_joined') else None,  # ป้องกันข้อผิดพลาด
    }
    return Response(profile_data)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user, context={'request': request})  # ✅ เพิ่ม context
        return Response(serializer.data, status=200)
  
class UpdateProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]  # ใช้เฉพาะผู้ที่ล็อกอิน

    def put(self, request):
        user = request.user  # ผู้ใช้ที่ส่ง request นี้
        data = request.data

        try:
            # อัปเดตข้อมูลส่วนตัว
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.phone_number = data.get('phone_number', user.phone_number)

            # จัดการรูปโปรไฟล์
            if 'profile_picture' in request.FILES:
                user.profile_picture = request.FILES['profile_picture']

            user.save()  # บันทึกข้อมูลลงฐานข้อมูล

            # ✅ ใช้ Serializer แทนการสร้าง JSON เอง
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data, status=200)

        except Exception as e:
            print(f"Error updating profile: {e}")
            return Response({'error': 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์'}, status=500)


class MemberManagementAPIView(APIView):
    permission_classes = [IsAuthenticated]

    # ดึงข้อมูลสมาชิกทั้งหมด
    def get(self, request):
        members = User.objects.filter(is_active=True)  # กรองเฉพาะสมาชิกที่ Active
        serializer = UserSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ลบสมาชิก
    def delete(self, request, pk=None):
        if not pk:
            return Response({"error": "Member ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            member = User.objects.get(pk=pk)
            member.delete()
            return Response({"message": "Member deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND)
        
class MemberDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            member = User.objects.get(pk=pk, is_active=True)
            serializer = UserSerializer(member, context={'request': request})  # ✅ เพิ่ม context
            data = serializer.data

            # ✅ ตรวจสอบว่า `profile_picture` มีค่าหรือไม่
            if member.profile_picture:
                if hasattr(member.profile_picture, 'url'):  # ป้องกันกรณีไฟล์หาย
                    data["profile_picture"] = request.build_absolute_uri(member.profile_picture.url)
                else:
                    data["profile_picture"] = None  # ถ้าไฟล์หายให้ส่งค่า None แทน

            return Response(data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND)


class VerifyTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ตรวจสอบว่าผู้ใช้ที่มี token อยู่ในระบบ
        return Response({"message": "Token is valid"}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "กรุณากรอกอีเมล"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "ไม่พบอีเมลนี้ในระบบ"}, status=status.HTTP_404_NOT_FOUND)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        try:
            send_mail(
                "รีเซ็ตรหัสผ่านของคุณ",
                f"กดลิงก์นี้เพื่อรีเซ็ตรหัสผ่านของคุณ: {reset_url}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,  # ✅ ป้องกันข้อผิดพลาดถ้าอีเมลส่งไม่ผ่าน
            )
        except Exception as e:
            return Response({"error": f"เกิดข้อผิดพลาดในการส่งอีเมล: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "โปรดตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน"}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        new_password = request.data.get("new_password")

        if not new_password:
            return Response({"error": "กรุณากรอกรหัสผ่านใหม่"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if not default_token_generator.check_token(user, token):
                return Response({"error": "Token ไม่ถูกต้องหรือหมดอายุ"}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({"message": "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว"}, status=status.HTTP_200_OK)

        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"error": "ไม่พบผู้ใช้ หรือ Token ไม่ถูกต้อง"}, status=status.HTTP_404_NOT_FOUND)