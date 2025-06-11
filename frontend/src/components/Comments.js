import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { refreshAccessToken } from "../utils/auth";
import Navbar from "./Navbar";
import "./Comments.css";

const Comments = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeReply, setActiveReply] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingReplyText, setEditingReplyText] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { state: { from: `/posts/${postId}/comments` } });
            return;
        }

        const fetchComments = async () => {
            setLoading(true);
            setError(null);
            try {
                const userRes = await fetch("http://localhost:8000/api/auth/user/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const userData = await userRes.json();
                setCurrentUserId(userData.id);

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

                if (!response.ok) throw new Error("Failed to fetch comments.");
                const data = await response.json();
                setComments(data);
            } catch (error) {
                setError("ไม่สามารถโหลดความคิดเห็นได้");
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId, navigate]);

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
                url = `http://localhost:8000/api/community/posts/${postId}/comments/${activeReply}/replies/`;
                body = { reply_text: commentText };
            } else {
                url = `http://localhost:8000/api/community/posts/${postId}/comments/`;
                body = { comment_text: commentText };
            }

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
                            ? {
                                ...comment,
                                replies: [...(comment.replies || []), newComment],
                            }
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

    const handleDeleteComment = async (commentId) => {
        const confirmDelete = window.confirm("คุณต้องการลบความคิดเห็นนี้หรือไม่?");
        if (!confirmDelete) return;

        const token = localStorage.getItem("token");
        try {
            await fetch(`http://localhost:8000/api/community/comments/${commentId}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(comments.filter(comment => comment.id !== commentId));
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการลบ");
            console.error(err.message);
        }
    };

    const handleUpdateComment = async (commentId) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8000/api/community/comments/${commentId}/`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ comment_text: editingText }),
            });

            if (!res.ok) throw new Error("ไม่สามารถแก้ไขความคิดเห็นได้");

            const updatedComment = await res.json();
            setComments(comments.map(comment =>
                comment.id === commentId ? updatedComment : comment
            ));

            setEditingCommentId(null);
            setEditingText("");
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการแก้ไข");
            console.error(error);
        }
    };

    const handleUpdateReply = async (replyId) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8000/api/community/replies/${replyId}/`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reply_text: editingReplyText }),
            });

            const updatedReply = await res.json();
            setComments(comments.map(comment => ({
                ...comment,
                replies: comment.replies.map(reply =>
                    reply.id === replyId ? updatedReply : reply
                )
            })));

            setEditingReplyId(null);
            setEditingReplyText("");
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการแก้ไขคำตอบ");
        }
    };

    const handleDeleteReply = async (replyId) => {
        const confirmDelete = window.confirm("คุณต้องการลบคำตอบนี้หรือไม่?");
        if (!confirmDelete) return;

        const token = localStorage.getItem("token");
        try {
            await fetch(`http://localhost:8000/api/community/replies/${replyId}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setComments(comments.map(comment => ({
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== replyId)
            })));
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการลบคำตอบ");
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

                                {editingCommentId === comment.id ? (
                                    <div className="edit-comment-section">
                                        <textarea
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            className="edit-comment-textarea"
                                        />
                                        <button
                                            className="save-edit-btn"
                                            onClick={() => handleUpdateComment(comment.id)}
                                        >
                                            💾 บันทึก
                                        </button>
                                        <button
                                            className="cancel-edit-btn"
                                            onClick={() => setEditingCommentId(null)}
                                        >
                                            ❌ ยกเลิก
                                        </button>
                                    </div>
                                ) : (
                                    <p className="comment-text">{comment.comment_text}</p>
                                )}

                                <div className="comment-actions-row">
                                    <button
                                        className="reply-button"
                                        onClick={() => setActiveReply(activeReply === comment.id ? null : comment.id)}
                                    >
                                        ตอบกลับ
                                    </button>

                                    {currentUserId === comment.user_id && (
                                        <>
                                            <button
                                                className="edit-btn"
                                                onClick={() => {
                                                    setEditingCommentId(comment.id);
                                                    setEditingText(comment.comment_text);
                                                }}
                                            >
                                                ✏️ แก้ไข
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                🗑️ ลบ
                                            </button>
                                        </>
                                    )}
                                </div>


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

                                                {editingReplyId === reply.id ? (
                                                    <div className="edit-reply-section">
                                                        <textarea
                                                            value={editingReplyText}
                                                            onChange={(e) => setEditingReplyText(e.target.value)}
                                                            className="edit-reply-textarea"
                                                        />
                                                        <button className="save-reply-btn" onClick={() => handleUpdateReply(reply.id)}>💾 บันทึก</button>
                                                        <button className="cancel-reply-btn" onClick={() => setEditingReplyId(null)}>❌ ยกเลิก</button>
                                                    </div>
                                                ) : (
                                                    <p className="reply-text">{reply.reply_text}</p>
                                                )}

                                                {currentUserId === reply.replied_by_user_id && (
                                                    <div className="reply-owner-actions">
                                                        <button className="edit-btn" onClick={() => {
                                                            setEditingReplyId(reply.id);
                                                            setEditingReplyText(reply.reply_text);
                                                        }}>✏️ แก้ไข</button>
                                                        <button className="delete-btn" onClick={() => handleDeleteReply(reply.id)}>🗑️ ลบ</button>
                                                    </div>
                                                )}
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
                        placeholder={activeReply ? "เขียนข้อความตอบกลับ" : "เขียนข้อความแสดงความคิดเห็น"}
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
