import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { refreshAccessToken } from "../utils/auth"; // นำเข้า refreshAccessToken
import Navbar from "./Navbar"; // เพิ่ม Navbar
import "./Comments.css"; // เพิ่ม CSS สำหรับการตกแต่ง
import { useNavigate } from "react-router-dom"; // เพิ่มส่วนนี้


const Comments = () => {
    const { postId } = useParams(); // ดึง postId จาก URL
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(false); // เพิ่ม state สำหรับ loading
    const [error, setError] = useState(null); // เพิ่ม state สำหรับ error
    const [activeReply, setActiveReply] = useState(null); // เพิ่ม state สำหรับ activeReply
    const navigate = useNavigate(); // ใช้ navigate เพื่อเปลี่ยนเส้นทาง

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { state: { from: `/posts/${postId}/comments` } }); // ส่งเส้นทางปัจจุบันใน state
            return;
        }

        const fetchComments = async () => {
            setLoading(true);
            setError(null);
            try {
                let response = await fetch(
                    `http://localhost:8000/api/community/posts/${postId}/comments/`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.status === 401) {
                    const newToken = await refreshAccessToken();
                    response = await fetch(
                        `http://localhost:8000/api/community/posts/${postId}/comments/`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${newToken}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch comments.");
                }

                const data = await response.json();
                setComments(data);
            } catch (error) {
                setError("ไม่สามารถโหลดความคิดเห็นได้");
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId, navigate]); // เพิ่ม navigate ลงใน dependency array

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
            return;
        }
    
        setLoading(true);
        setError(null);
    
        try {
            let url;
            let body;
    
            if (activeReply) {
                // การตอบกลับ
                url = `http://localhost:8000/api/community/posts/${postId}/comments/${activeReply}/replies/`;
                body = { reply_text: commentText };
            } else {
                // การคอมเมนต์ปกติ
                url = `http://localhost:8000/api/community/posts/${postId}/comments/`;
                body = { comment_text: commentText };
            }
    
            console.log("Request URL:", url);
            console.log("Request Payload:", body);
    
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error Response:", errorData);
                throw new Error("Failed to submit.");
            }
    
            const newComment = await response.json();
    
            if (activeReply) {
                setComments((prev) =>
                    prev.map((comment) =>
                        comment.id === activeReply
                            ? { ...comment, replies: [...(comment.replies || []), newComment] }
                            : comment
                    )
                );
            } else {
                setComments((prev) => [...prev, newComment]);
            }
    
            setCommentText("");
            setActiveReply(null);
        } catch (error) {
            setError("ไม่สามารถเพิ่มความคิดเห็นได้");
            console.error("Error submitting comment:", error);
        } finally {
            setLoading(false);
        }
    };
    
    
    return (
        <div className="comments-page">
            <Navbar />
            <div className="comments-container">
                <div className="post-section">
                    <h1>ความคิดเห็น</h1>
                    {loading && <p className="loading-text">กำลังโหลดความคิดเห็น...</p>}
                    {error && <p className="error-text">เกิดข้อผิดพลาด: {error}</p>}
                    {Array.isArray(comments) && comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="comment-card">
                                <div className="comment-header">
                                    <img
                                        src={comment.user_profile_picture || '/default-profile.png'}
                                        alt="User Profile"
                                        className="comment-profile-pic"
                                    />
                                    <span className="comment-user">{comment.user_name}</span>
                                </div>
                                <p className="comment-text">{comment.comment_text}</p>
                                <button
                                    className="reply-button"
                                    onClick={() => setActiveReply(activeReply === comment.id ? null : comment.id)}
                                >
                                    ตอบกลับ
                                </button>

                                {/* แสดงคำตอบในโครงสร้างซ้อน */}
                                {comment.replies?.length > 0 && (
                                    <div className="comment-replies">
                                        {comment.replies.map((reply) => (
                                            <div key={reply.id} className="reply-card">
                                                <div className="reply-header">
                                                    <img
                                                        src={reply.replied_by_user_profile_picture || '/default-profile.png'}
                                                        alt="Reply User Profile"
                                                        className="reply-profile-pic"
                                                    />
                                                    <span className="reply-user">{reply.replied_by_user_name}</span>
                                                </div>
                                                <span className="reply-to-text">ตอบกลับ: {comment.user_name}</span>
                                                <p className="reply-text">{reply.reply_text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        !loading && <p className="no-comments-text">ยังไม่มีคอมเมนต์</p>
                    )}

                </div>
                {activeReply && (
                    <div className="active-reply-info">
                        <p>
                            กำลังตอบกลับความคิดเห็นของ:{" "}
                            {comments.find((comment) => comment.id === activeReply)?.user_name}
                        </p>
                        <button
                            className="cancel-reply-button"
                            onClick={() => setActiveReply(null)}
                        >
                            ยกเลิก
                        </button>
                    </div>
                )}
                <div className="add-comment-section">
                    <textarea
                        className="add-comment-textarea"
                        placeholder={
                            activeReply ? "เขียนข้อความตอบกลับ" : "เขียนข้อความแสดงความคิดเห็น"
                        }
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button
                        className="add-comment-button"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "กำลังส่ง..." : "ส่ง"}
                    </button>
                </div>
            </div>
        </div>
    );


};

export default Comments;
