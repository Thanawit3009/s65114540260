from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Collection
from .serializers import CollectionSerializer
from rest_framework import status
from rest_framework.permissions import AllowAny

# View สำหรับผู้ใช้ส่งคำขอเพิ่มคอลเล็กชั่น
class CreateCollectionRequestView(APIView):
    permission_classes = [IsAuthenticated]  # ต้องล็อกอินก่อนส่งคำขอ

    def post(self, request):
        serializer = CollectionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # ผูกคอลเล็กชั่นกับผู้ใช้
            return Response(
                {"message": "Collection request created successfully."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View สำหรับ admin จัดการคำขอคอลเล็กชั่น
class AdminCollectionApprovalView(APIView):
    permission_classes = [IsAdminUser]  # เฉพาะ admin เท่านั้น

    def get(self, request):
        collections = Collection.objects.filter(is_approved=False)
        serializer = CollectionSerializer(collections, many=True)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            collection = Collection.objects.get(pk=pk)
            collection.is_approved = True  # อนุมัติคำขอ
            collection.save()
            return Response({"message": "Collection approved successfully."})
        except Collection.DoesNotExist:
            return Response({"error": "Collection not found."}, status=404)

    def delete(self, request, pk):
        try:
            collection = Collection.objects.get(pk=pk)
            collection.delete()  # ลบคำขอ
            return Response({"message": "Collection deleted successfully."})
        except Collection.DoesNotExist:
            return Response({"error": "Collection not found."}, status=404)

# View สำหรับแสดงคอลเล็กชั่นที่อนุมัติแล้ว
class ApprovedCollectionsView(APIView):
    permission_classes = [IsAuthenticated]  # ต้องล็อกอินก่อน

    def get(self, request):
        # ดึงเฉพาะคอลเล็กชั่นที่เป็นของผู้ใช้ที่ล็อกอินและอนุมัติแล้ว
        collections = Collection.objects.filter(is_approved=True, user=request.user)
        serializer = CollectionSerializer(collections, many=True)
        return Response(serializer.data)
    
class EditCollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        print(f"Edit request received for collection ID: {pk}")  # Debug Log
        print(f"User: {request.user}")  # Debug Log
        print(f"Request data: {request.data}")  # Debug Log

        try:
            collection = Collection.objects.get(pk=pk, user=request.user)  # ตรวจสอบว่าเป็นเจ้าของ
            new_name = request.data.get("name", None)
            if not new_name:
                return Response({"error": "Name is required."}, status=status.HTTP_400_BAD_REQUEST)

            collection.name = new_name
            collection.save()
            return Response({"message": "Collection name updated successfully."}, status=status.HTTP_200_OK)
        except Collection.DoesNotExist:
            return Response({"error": "Collection not found or not authorized."}, status=status.HTTP_404_NOT_FOUND)


class ShareCollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            collection = Collection.objects.get(pk=pk, user=request.user)
            collection.is_shared = True
            collection.save()
            return Response({"message": "Collection shared successfully."}, status=status.HTTP_200_OK)
        except Collection.DoesNotExist:
            return Response({"error": "Collection not found or not authorized."}, status=status.HTTP_404_NOT_FOUND)

class UnshareCollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            collection = Collection.objects.get(pk=pk, user=request.user)
            collection.is_shared = False
            collection.save()
            return Response({"message": "Collection unshared successfully."}, status=status.HTTP_200_OK)
        except Collection.DoesNotExist:
            return Response({"error": "Collection not found or not authorized."}, status=status.HTTP_404_NOT_FOUND)


class PublicCollectionsView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request):
        collections = Collection.objects.filter(is_shared=True).select_related('user').order_by('-created_at')  
        data = [
            {
                "id": collection.id,
                "name": collection.name,
                "description": collection.description,
                "image": request.build_absolute_uri(collection.image.url) if collection.image else None,
                "created_at": collection.created_at,
                "user": {
                    "id": collection.user.id,  # ✅ เพิ่ม user.id
                    "first_name": collection.user.first_name,
                    "last_name": collection.user.last_name,
                    "profile_picture": request.build_absolute_uri(collection.user.profile_picture.url) if collection.user.profile_picture else None,
                }
            }
            for collection in collections
        ]
        return Response(data, status=status.HTTP_200_OK)



    
class MemberApprovedCollectionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, member_id):
        try:
            # ตรวจสอบว่ามี collections ตรงกับ member_id และ is_approved=True หรือไม่
            collections = Collection.objects.filter(
                user_id=member_id, is_approved=True
            )

            if not collections.exists():
                # ส่งข้อความเมื่อไม่มีคอลเล็กชั่น
                return Response(
                    {"message": "คนนี้ยังไม่มีคอลเล็กชั่น"},  # เปลี่ยน error เป็น message
                    status=status.HTTP_200_OK,  # ใช้สถานะ 200 แทน 404
                )

            # หากมีคอลเล็กชั่น ส่งข้อมูลที่ serialize กลับไป
            serializer = CollectionSerializer(collections, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class DeleteCollectionView(APIView):
    def delete(self, request, pk, *args, **kwargs):
        try:
            collection = Collection.objects.get(pk=pk)
            collection.delete()
            return Response({"message": "Collection deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Collection.DoesNotExist:
            return Response({"error": "Collection not found"}, status=status.HTTP_404_NOT_FOUND)
