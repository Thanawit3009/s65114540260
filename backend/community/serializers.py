from rest_framework import serializers
from .models import Post, Comment, CommentReply, Review
from django.contrib.auth import get_user_model

User = get_user_model()  # ดึง User Model ให้ใช้งานได้ทุกที่


class PostSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()  # ชื่อผู้โพสต์
    profile_picture = serializers.SerializerMethodField()  # รูปโปรไฟล์ของผู้โพสต์
    user_id = serializers.IntegerField(source='user.id', read_only=True)  # เพิ่ม user_id
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)  # จำนวน Like ทั้งหมด
    is_liked = serializers.SerializerMethodField()  # สถานะการ Like ของผู้ใช้ปัจจุบัน

    class Meta:
        model = Post
        fields = [
            'id', 'user_id', 'user_name', 'profile_picture', 'title',
            'content', 'image', 'image_url', 'created_at', 'likes_count', 'is_liked'
        ]

    def get_user_name(self, obj):
        """แสดงชื่อและนามสกุลผู้ใช้"""
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.email  # สำรองเป็น email ถ้าไม่มีชื่อและนามสกุล

    def get_profile_picture(self, obj):
        """ดึง URL รูปโปรไฟล์ของผู้โพสต์"""
        request = self.context.get('request')
        if obj.user.profile_picture:  # ตรวจสอบว่าผู้ใช้มีรูปโปรไฟล์หรือไม่
            return request.build_absolute_uri(obj.user.profile_picture.url)
        return None  # ถ้าไม่มีรูปโปรไฟล์ ให้ส่งค่า None

    def get_is_liked(self, obj):
        """ตรวจสอบว่าผู้ใช้ปัจจุบันได้กด Like โพสต์นี้หรือไม่"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False  # ถ้าผู้ใช้ไม่ได้ล็อกอิน

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # เพิ่ม URL แบบเต็มของรูปภาพโพสต์
        request = self.context.get('request')
        if instance.image:
            representation['image'] = request.build_absolute_uri(instance.image.url)
        return representation

class CommentReplySerializer(serializers.ModelSerializer):
    replied_by_user_name = serializers.SerializerMethodField()
    replied_by_user_profile_picture = serializers.SerializerMethodField()
    replied_by_user_id = serializers.IntegerField(source='replied_by_user.id', read_only=True)  # เพิ่ม user_id

    class Meta:
        model = CommentReply
        fields = [
            'id', 'reply_text', 'parent_comment', 'replied_by_user', 
            'replied_by_user_id', 'replied_by_user_name', 
            'replied_by_user_profile_picture', 'created_at'
        ]
        extra_kwargs = {
            'reply_text': {'required': True},
            'parent_comment': {'required': True},
        }

    def get_replied_by_user_name(self, obj):
        """Retrieve the name of the user who replied"""
        if obj.replied_by_user.first_name or obj.replied_by_user.last_name:
            return f"{obj.replied_by_user.first_name} {obj.replied_by_user.last_name}".strip()
        return obj.replied_by_user.email

    def get_replied_by_user_profile_picture(self, obj):
        """Retrieve the profile picture of the user who replied"""
        request = self.context.get('request')
        if obj.replied_by_user.profile_picture:
            return request.build_absolute_uri(obj.replied_by_user.profile_picture.url)
        return '/default-profile.png'  # กำหนด fallback รูปโปรไฟล์

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_profile_picture = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    replies = CommentReplySerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id', 'comment_text', 'post', 'user', 'user_id', 
            'user_name', 'user_profile_picture', 'created_at', 
            'updated_at', 'replies'
        ]
        read_only_fields = ['post', 'user', 'created_at', 'updated_at']  # post และ user ต้องไม่สามารถแก้ไขได้

    def create(self, validated_data):
        # ดึงข้อมูล post และ request จาก context
        post = self.context.get('post')
        request = self.context.get('request')

        if not post:
            raise serializers.ValidationError({'post': 'Post instance is required in context.'})

        validated_data['post'] = post
        validated_data['user'] = request.user  # ใช้ผู้ใช้ที่ล็อกอินเป็นเจ้าของคอมเมนต์

        return super().create(validated_data)

    def get_user_name(self, obj):
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.email

    def get_user_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.user.profile_picture:
            return request.build_absolute_uri(obj.user.profile_picture.url)
        return None



class ReviewSerializer(serializers.ModelSerializer):
    reviewer_profile_picture = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['review_id', 'review_text', 'created_at', 'reviewer_profile_picture', 'reviewer_name']

    def create(self, validated_data):
        """
        ฟังก์ชันสร้าง Review: ตรวจสอบว่า reviewed_user และ reviewer มีค่าถูกต้องก่อนบันทึก
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({'error': 'Authentication required.'})

        User = get_user_model()  # ✅ ใช้ get_user_model() เพื่อให้แน่ใจว่าใช้ AUTH_USER_MODEL
        reviewed_user_id = self.context.get('user_id')  # ✅ ใช้จาก context

        if not reviewed_user_id:
            raise serializers.ValidationError({'error': 'Missing user_id in context.'})

        # ตรวจสอบว่า reviewed_user_id มีอยู่จริง
        try:
            reviewed_user = User.objects.get(id=reviewed_user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({'reviewed_user': 'Invalid user ID'})

        # กำหนดค่า reviewer และ reviewed_user
        validated_data['reviewed_user'] = reviewed_user
        validated_data['reviewer'] = request.user

        return super().create(validated_data)

    def get_reviewer_profile_picture(self, obj):
        """
        คืนค่า URL รูปโปรไฟล์ของผู้ที่รีวิว
        """
        request = self.context.get('request')
        if obj.reviewer.profile_picture:
            return request.build_absolute_uri(obj.reviewer.profile_picture.url)
        return '/default-profile.png'

    def get_reviewer_name(self, obj):
        """
        คืนค่าชื่อของผู้ที่รีวิว
        """
        return f"{obj.reviewer.first_name} {obj.reviewer.last_name}".strip()
    
