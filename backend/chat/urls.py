from django.urls import path
from .views import ChatRoomView, MessageView, ChatRoomListView, ChatRoomDetailView

urlpatterns = [
    path("chat-room/", ChatRoomView.as_view(), name="chat-room"),
    path("chat-room/<int:chat_id>/messages/", MessageView.as_view(), name="chat-messages"),
    path("chat-room-list/", ChatRoomListView.as_view(), name="chat-room-list"),  # เส้นทางใหม่
    path("chat-room/<int:chat_id>/", ChatRoomDetailView.as_view(), name="chat-room-detail"),

]

