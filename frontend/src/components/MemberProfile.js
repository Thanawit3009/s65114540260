import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { refreshAccessToken } from "../utils/auth";
import Navbar from "./Navbar"; // นำ Navbar เข้ามา
import "./MemberProfile.css";

const MemberProfile = () => {
  const { id: memberId } = useParams(); // ดึง memberId จาก URL
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get(
          `http://localhost:8000/api/member/${memberId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMemberData(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          try {
            const newToken = await refreshAccessToken();
            const retryResponse = await axios.get(
              `http://localhost:8000/api/member/${memberId}`,
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );
            setMemberData(retryResponse.data);
            setLoading(false);
          } catch (refreshError) {
            setError("Session expired. Please log in again.");
            setLoading(false);
          }
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchMemberData();
  }, [memberId]);

  // ฟังก์ชันเมื่อกดปุ่ม Message
  const handleStartChat = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อนเริ่มแชท");
        throw new Error("No token found");
      }
  
      const response = await axios.post(
        "http://localhost:8000/api/chat/chat-room/", // ตรวจสอบ URL
        { user2_id: memberId }, // ตรวจสอบว่ามีการส่ง user2_id
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // กำหนด Content-Type
          },
        }
      );
  
      if (response.status === 200 || response.status === 201) {
        const chatId = response.data.id; // ใช้ `id` แทน `chat_id`
        navigate(`/chat/${chatId}`); // นำผู้ใช้ไปที่ ChatPage
      } else {
        console.error("Unexpected response status:", response.status);
        alert("เกิดข้อผิดพลาดในการสร้างหรือดึงห้องแชท");
      }
    } catch (error) {
      console.error("Error creating or fetching chat room:", error);
      alert("ไม่สามารถเริ่มการแชทได้ กรุณาลองอีกครั้ง");
    }
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="member-profile-page">
      <Navbar /> {/* ใส่ Navbar */}
      <div className="member-profile">
        <div className="profile-header">
          <img
            src={memberData.profile_picture || "/default-profile.png"}
            alt={`${memberData.first_name} ${memberData.last_name}`}
            className="profile-picture"
          />
          <h1>
            {memberData.first_name} {memberData.last_name}
          </h1>
          <p>{memberData.email}</p>
        </div>

        <div className="profile-tabs">
          <button onClick={() => navigate(`/collection/${memberId}`)}>
            Collection
          </button>
          <button onClick={handleStartChat}>Message</button> {/* ปุ่มแชท */}
          <button onClick={() => navigate(`/reviews/${memberId}`)}>Review</button>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
