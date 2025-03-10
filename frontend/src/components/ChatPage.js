import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar"; // ✅ เพิ่ม Navbar
import "./ChatPage.css";

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatPartner, setChatPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const messagesEndRef = useRef(null);

  // ✅ Auto Scroll เมื่อมีข้อความใหม่
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  // ✅ ดึง User ID จาก Local Storage
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      console.error("User ID is null. Redirecting to login...");
      navigate("/login");
    } else {
      setCurrentUserId(parseInt(storedUserId, 10));
    }
  }, [navigate]);

  // ✅ ตรวจสอบ chatId ว่าถูกต้องหรือไม่
  useEffect(() => {
    if (!chatId || chatId === "undefined") {
      navigate("/messages");
    }
  }, [chatId, navigate]);

  // ✅ ฟังก์ชันดึงข้อมูลแชท
  const fetchChatData = useCallback(async () => {
    if (!currentUserId || !chatId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        `http://localhost:8000/api/chat/chat-room/${chatId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const chatData = response.data;
      setMessages(chatData.messages);

      const partner = chatData.user1.id === currentUserId ? chatData.user2 : chatData.user1;
      setChatPartner(partner);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (currentUserId && chatId) {
      fetchChatData();
    }
  }, [fetchChatData, currentUserId, chatId]);

  // ✅ ฟังก์ชันส่งข้อความ
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:8000/api/chat/chat-room/${chatId}/messages/`,
        { message: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setMessages((prev) => [...prev, response.data]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // ✅ ฟังก์ชันนำทางไปยังหน้าโปรไฟล์ของคู่สนทนา
  const handleProfileClick = () => {
    if (chatPartner) {
      navigate(`/member/${chatPartner.id}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="chat-page">
      {/* 🔹 Navbar ด้านบน */}
      <Navbar />
  
      {/* 🔹 กล่องแชท */}
      <div className="chat-container">
        {/* 🔹 ชื่อและรูปโปรไฟล์ของคู่สนทนา (ย้ายมาไว้ใน chat-container) */}
        {chatPartner && (
          <div className="chat-topbar">
            <img
              src={chatPartner.profile_picture || "/default-profile.png"}
              alt="Profile"
              className="topbar-avatar"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
              onError={(e) => (e.target.src = "/default-profile.png")}
            />
            <span className="topbar-name">{`${chatPartner.first_name} ${chatPartner.last_name}`}</span>
          </div>
        )}
  
        {/* 🔹 ส่วนแสดงข้อความแชท */}
        <div className="chat-messages">
          {messages.map((msg, index) => {
            const isMyMessage = msg.sender.id === currentUserId;
            return (
              <div
                key={msg.id || `msg-${index}`}
                className={`message-container ${isMyMessage ? "sent" : "received"}`}
              >
                <div className={`message-bubble ${isMyMessage ? "my-message" : "other-message"}`}>
                  <p>{msg.message}</p>
                </div>
              </div>
            );
          })}
  
          {/* 🔹 ตำแหน่งข้อความล่าสุด สำหรับ Auto Scroll */}
          <div ref={messagesEndRef} />
        </div>
  
        {/* 🔹 กล่องพิมพ์ข้อความ */}
        <div className="chat-input">
          <input
            type="text"
            placeholder="พิมพ์ข้อความ..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>ส่ง</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
