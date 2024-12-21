from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()  # ใช้ SerializerMethodField สำหรับดึงค่าที่ต้องการ

    class Meta:
        model = Post
        fields = ['id', 'user_name', 'title', 'content', 'image', 'image_url', 'created_at']

    def get_user_name(self, obj):
        """แสดงชื่อและนามสกุลผู้ใช้"""
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()  # รวมชื่อและนามสกุล
        return obj.user.email  # สำรองเป็น email ถ้าไม่มีชื่อและนามสกุล

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # เพิ่ม URL แบบเต็มของรูปภาพ
        request = self.context.get('request')
        if instance.image:
            representation['image'] = request.build_absolute_uri(instance.image.url)
        return representation
