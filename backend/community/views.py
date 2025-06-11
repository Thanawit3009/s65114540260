from rest_framework import generics, status
from .models import Post, Comment, CommentReply, Review, Like
from .serializers import PostSerializer, CommentSerializer, CommentReplySerializer, ReviewSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAdminUser
from mycollections.models import Collection
from rest_framework.exceptions import PermissionDenied
import logging

logger = logging.getLogger(__name__)


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


class PostListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            posts = Post.objects.select_related('user').order_by('-created_at')
            response_data = [
                {
                    "id": post.id,
                    "user_name": f"{post.user.first_name} {post.user.last_name}".strip() if post.user.first_name or post.user.last_name else post.user.email,
                    "user_id": post.user.id if post.user else None,
                    "profile_picture": request.build_absolute_uri(post.user.profile_picture.url) if post.user and post.user.profile_picture else None,
                    "title": post.title,
                    "content": post.content,
                    "image": request.build_absolute_uri(post.image.url) if post.image else None,
                    "likes_count": post.likes_count,  # จำนวนไลค์ทั้งหมดของโพสต์
                    "is_liked_by_user": post.is_liked_by_user(request.user) if request.user.is_authenticated else False,  # ผู้ใช้กดไลค์โพสต์นี้หรือไม่
                    "created_at": post.created_at,
                }
                for post in posts
            ]
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PublicPostListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            public_posts = Post.objects.select_related('user').order_by('-created_at')
            response_data = [
                {
                    "id": post.id,
                    "user_name": f"{post.user.first_name} {post.user.last_name}".strip() if post.user.first_name or post.user.last_name else post.user.email,
                    "user_id": post.user.id if post.user else None,
                    "profile_picture": request.build_absolute_uri(post.user.profile_picture.url) if post.user and post.user.profile_picture else None,
                    "title": post.title,
                    "content": post.content,
                    "image": request.build_absolute_uri(post.image.url) if post.image else None,
                    "created_at": post.created_at,
                }
                for post in public_posts
            ]
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class CommentListView(APIView): 
    permission_classes = [IsAuthenticated]  # ให้เฉพาะผู้ใช้ที่ล็อกอินสามารถคอมเมนต์ได้

    def get(self, request, post_id):
        try:
            # ตรวจสอบว่าโพสต์นี้มีอยู่หรือไม่
            if not Post.objects.filter(id=post_id).exists():
                return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

            # ดึงข้อมูลความคิดเห็น
            comments = Comment.objects.filter(post_id=post_id).select_related('user').prefetch_related('replies')
            serializer = CommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, post_id):
        try:
            # ตรวจสอบว่าโพสต์นี้มีอยู่หรือไม่
            try:
                post = Post.objects.get(id=post_id)
            except Post.DoesNotExist:
                return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

            # ตรวจสอบว่ามี comment_text ในข้อมูลที่ส่งมา
            comment_text = request.data.get('comment_text', '').strip()
            if not comment_text:
                return Response({"error": "Comment text is required."}, status=status.HTTP_400_BAD_REQUEST)

            # ส่ง post instance และ request ผ่าน context
            serializer = CommentSerializer(data=request.data, context={'request': request, 'post': post})
            
            if serializer.is_valid():
                serializer.save()  # บันทึกข้อมูล
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CommentReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id, comment_id):
        print(f"Received request at: /api/community/posts/{post_id}/comments/{comment_id}/replies/")
        print("Payload received in POST request:", request.data)

        data = request.data.copy()
        data['parent_comment'] = comment_id
        data['replied_by_user'] = request.user.id

        print("Payload after modification:", data)

        serializer = CommentReplySerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        reviews = Review.objects.filter(reviewed_user_id=user_id)
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})
        logger.debug(f"📌 Debug - Fetched Reviews for user_id {user_id}: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, user_id):
        User = get_user_model()

        # ตรวจสอบว่า reviewed_user มีอยู่จริง
        try:
            reviewed_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error(f"❌ Error: reviewed_user with ID {user_id} does not exist.")
            return Response({"error": "Reviewed user not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['reviewed_user'] = reviewed_user.id
        data['reviewer'] = request.user.id

        logger.debug(f"📌 Debug - Review Data Before Serialization: {data}")
        serializer = ReviewSerializer(data=data, context={'request': request, 'user_id': user_id})
        if serializer.is_valid():
            try:
                serializer.save(reviewer=request.user, reviewed_user=reviewed_user)
                logger.info(f"✅ Review successfully created: {serializer.data}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"❌ Error creating review: {str(e)}")
                return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        logger.error(f"❌ Validation Errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LikePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        try:
            # ตรวจสอบว่าโพสต์มีอยู่จริง
            post = Post.objects.get(id=post_id)

            # ตรวจสอบว่า Like มีอยู่หรือไม่
            like, created = Like.objects.get_or_create(user=request.user, post=post)

            if not created:
                # ถ้า Like มีอยู่แล้ว ให้ลบ Like ออก (Unlike)
                like.delete()
                message = "Unlike successful."
            else:
                message = "Like successful."

            # ส่งจำนวนไลค์ที่อัปเดตกลับ
            return Response({
                "message": message,
                "likes_count": post.likes.count()  # นับจำนวนไลค์ทั้งหมดในโพสต์
            }, status=200)

        except Post.DoesNotExist:
            return Response({"error": "Post not found."}, status=404)


class DashboardOverviewView(APIView):
    permission_classes = [IsAdminUser]  # อนุญาตเฉพาะ Admin

    def get(self, request):
        try:
            posts_count = Post.objects.count()
            comments_count = Comment.objects.count()
            collections_count = Collection.objects.count()

            data = {
                "posts_count": posts_count,
                "comments_count": comments_count,
                "collections_count": collections_count,
            }
            return Response(data, status=200)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)
        

class PostDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, post_id):
        try:
            return Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise Response({"error": "Post not found."}, status=404)

    def get(self, request, post_id):
        post = self.get_object(post_id)
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data)

    def put(self, request, post_id):
        post = self.get_object(post_id)
        if post.user != request.user:
            raise PermissionDenied("คุณไม่สามารถแก้ไขโพสต์ของผู้อื่นได้")

        serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, post_id):
        post = self.get_object(post_id)
        if post.user != request.user:
            raise PermissionDenied("คุณไม่สามารถลบโพสต์ของผู้อื่นได้")

        post.delete()
        return Response({"message": "ลบโพสต์สำเร็จ"}, status=204)
    
class CommentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, comment_id):
        try:
            return Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            raise Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, comment_id):
        comment = self.get_object(comment_id)

        if comment.user != request.user:
            raise PermissionDenied("คุณไม่สามารถแก้ไขคอมเมนต์ของผู้อื่นได้")

        serializer = CommentSerializer(comment, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, comment_id):
        comment = self.get_object(comment_id)

        if comment.user != request.user:
            raise PermissionDenied("คุณไม่สามารถลบคอมเมนต์ของผู้อื่นได้")

        comment.delete()
        return Response({"message": "ลบความคิดเห็นสำเร็จ"}, status=status.HTTP_204_NO_CONTENT)
    
class CommentReplyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, reply_id):
        try:
            return CommentReply.objects.get(id=reply_id)
        except CommentReply.DoesNotExist:
            return None

    def put(self, request, reply_id):
        reply = self.get_object(reply_id)
        if not reply:
            return Response({"error": "Reply not found."}, status=status.HTTP_404_NOT_FOUND)

        if reply.replied_by_user != request.user:
            raise PermissionDenied("คุณไม่สามารถแก้ไขคำตอบของผู้อื่นได้")

        serializer = CommentReplySerializer(reply, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, reply_id):
        reply = self.get_object(reply_id)
        if not reply:
            return Response({"error": "Reply not found."}, status=status.HTTP_404_NOT_FOUND)

        if reply.replied_by_user != request.user:
            raise PermissionDenied("คุณไม่สามารถลบคำตอบของผู้อื่นได้")

        reply.delete()
        return Response({"message": "ลบคำตอบสำเร็จ"}, status=status.HTTP_204_NO_CONTENT)

