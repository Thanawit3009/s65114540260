import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./MessageDropdown.css";

const MessageDropdown = ({ isOpen, toggleDropdown }) => {
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const fetchChatList = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No token found.");
            }

            const response = await fetch("http://localhost:8000/api/chat/chat-room-list/", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch chat list: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // ✅ ตรวจสอบ partner และเพิ่ม profile_picture
            const formattedChatList = data.map((chat) => ({
                chat_id: chat.chat_id || null,
                partner: chat.partner || { first_name: "Unknown", last_name: "", profile_picture: null },
                last_message: chat.last_message || "No messages yet",
            }));

            setChatList(formattedChatList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching chat list:", error);
            setError("Unable to fetch chat list.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchChatList();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                toggleDropdown(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, toggleDropdown]);

    return (
        isOpen && (
            <div className="message-dropdown" ref={dropdownRef}>
                <h3 className="dropdown-title">ข้อความ</h3>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                {chatList.length === 0 && !loading && <p>No conversations found.</p>}

                <ul>
                    {chatList.map((chat) => (
                        <li
                            key={chat.chat_id}
                            onClick={() => navigate(`/chat/${chat.chat_id}`)}
                            className="chat-item"
                        >
                            {/* ✅ รูปโปรไฟล์คู่สนทนา */}
                            <img
                                src={chat.partner.profile_picture || "/default-profile.png"}
                                alt="Profile"
                                className="chat-profile-pic"
                                onError={(e) => (e.target.src = "/default-profile.png")}
                            />
                            <div className="chat-info">
                                <strong>{`${chat.partner.first_name} ${chat.partner.last_name}`}</strong>
                                <div className="last-message">{chat.last_message}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )
    );
};

export default MessageDropdown;
