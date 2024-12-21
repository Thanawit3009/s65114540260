from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number']
        extra_kwargs = {
            'phone_number': {'required': False},  # ระบุให้ phone_number ไม่จำเป็นต้องใส่ก็ได้
        }