from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user1 = request.user
        user2_id = request.data.get('user2_id')

        if not user2_id:
            return Response({"error": "user2_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        user2 = get_object_or_404(User, id=user2_id)

        chat_room, created = ChatRoom.objects.get_or_create(
            user1=min(user1, user2, key=lambda user: user.id),
            user2=max(user1, user2, key=lambda user: user.id),
        )

        # ✅ ส่ง `context={'request': request}`
        serializer = ChatRoomSerializer(chat_room, context={'request': request})

        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class MessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        try:
            chat_room = get_object_or_404(ChatRoom, id=chat_id)

            if request.user not in [chat_room.user1, chat_room.user2]:
                return Response({"error": "You are not authorized to view this chat room"}, status=status.HTTP_403_FORBIDDEN)

            # ✅ ใช้ `chat_room` แทน `chat_id`
            messages = Message.objects.filter(chat_room=chat_room).order_by('created_at')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, chat_id):
        try:
            sender = request.user
            chat_room = get_object_or_404(ChatRoom, id=chat_id)

            if sender not in [chat_room.user1, chat_room.user2]:
                return Response({"error": "You are not authorized to send messages in this chat room"}, status=status.HTTP_403_FORBIDDEN)

            receiver = chat_room.user2 if chat_room.user1 == sender else chat_room.user1
            message = Message.objects.create(
                sender=sender,
                receiver=receiver,
                chat_room=chat_room,  # ✅ ใช้ `chat_room` แทน `chat_id`
                message=request.data.get("message")
            )

            serializer = MessageSerializer(message)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatRoomListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            chat_rooms = ChatRoom.objects.filter(models.Q(user1=user) | models.Q(user2=user)).order_by("-created_at")

            data = []
            for room in chat_rooms:
                partner = room.user2 if room.user1 == user else room.user1
                last_message = room.messages.order_by("-created_at").first()

                # ✅ ป้องกัน `NoneType` error
                profile_picture_url = None
                if partner and hasattr(partner, 'profile_picture') and partner.profile_picture:
                    profile_picture_url = request.build_absolute_uri(partner.profile_picture.url)

                partner_data = {
                    "id": partner.id if partner else None,
                    "first_name": partner.first_name if partner else "Unknown",
                    "last_name": partner.last_name if partner else "",
                    "email": partner.email if partner else "No Email",
                    "profile_picture": profile_picture_url
                }

                data.append({
                    "chat_id": room.id,
                    "partner": partner_data,
                    "last_message": last_message.message if last_message else None,
                    "created_at": room.created_at,
                })

            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChatRoomDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        chat_room = get_object_or_404(ChatRoom, id=chat_id)

        if request.user not in [chat_room.user1, chat_room.user2]:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        messages = Message.objects.filter(chat_room=chat_room).order_by("created_at")
        message_data = MessageSerializer(messages, many=True).data

        return Response({
            "id": chat_room.id,
            "user1": UserSerializer(chat_room.user1, context={'request': request}).data,  # ✅ เพิ่ม context
            "user2": UserSerializer(chat_room.user2, context={'request': request}).data,  # ✅ เพิ่ม context
            "messages": message_data
        })
