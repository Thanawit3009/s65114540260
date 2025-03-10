from rest_framework import serializers
from .models import ChatRoom, Message
from users.serializers import UserSerializer  # ✅ ใช้ UserSerializer จากแอป users

class ChatRoomSerializer(serializers.ModelSerializer):
    user1 = serializers.SerializerMethodField()
    user2 = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'user1', 'user2', 'created_at']

    def get_user1(self, obj):
        return UserSerializer(obj.user1, context=self.context).data  # ✅ ส่ง context

    def get_user2(self, obj):
        return UserSerializer(obj.user2, context=self.context).data  # ✅ ส่ง context


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    receiver = UserSerializer()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'message', 'created_at']
