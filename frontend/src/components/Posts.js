import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Posts.css';
import { refreshAccessToken } from '../utils/auth';
import Navbar from './Navbar';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      if (token) {
        // ผู้ใช้ล็อกอิน
        setIsLoggedIn(true);

        // ดึงข้อมูลผู้ใช้ปัจจุบัน
        const userResponse = await axios.get('http://localhost:8000/api/auth/user/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(userResponse.data.id);

        // ดึงโพสต์สำหรับผู้ใช้ที่ล็อกอิน
        const response = await axios.get('http://localhost:8000/api/community/posts/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // อัปเดตโพสต์พร้อมสถานะ isLiked
        setPosts(
          response.data.map((post) => ({
            ...post,
            isLiked: post.is_liked_by_user || false, // เพิ่ม isLiked จาก backend
          }))
        );
      } else {
        // ผู้ใช้ไม่ได้ล็อกอิน
        const response = await axios.get('http://localhost:8000/api/community/posts/public/');

        // อัปเดตโพสต์แบบ public โดยไม่มีสถานะ isLiked
        setPosts(
          response.data.map((post) => ({
            ...post,
            isLiked: false, // ไม่มี isLiked สำหรับผู้ใช้ที่ไม่ได้ล็อกอิน
          }))
        );
      }
    } catch (error) {
      if (error.response?.status === 401 && token) {
        // กรณี Token หมดอายุ
        try {
          const newToken = await refreshAccessToken();
          localStorage.setItem('token', newToken);
          fetchPosts(); // เรียก fetchPosts ใหม่
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError.message);
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          navigate('/login'); // นำผู้ใช้ไปที่หน้า Login
        }
      } else {
        console.error('Error fetching posts:', error.message);
      }
    } finally {
      setLoading(false); // จบการโหลดไม่ว่ากรณีใดๆ
    }
  }, [navigate]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('คุณต้องเข้าสู่ระบบก่อนจึงจะกดถูกใจได้');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/api/community/posts/${postId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                ...post,
                likes_count: response.data.likes_count, // อัปเดตจำนวนไลค์
                isLiked: !post.isLiked, // เปลี่ยนสถานะไลค์
              }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error.message);
      alert('เกิดข้อผิดพลาดในการกดถูกใจ');
    }
  };


  const handleComment = (postId) => {
    navigate(`/posts/${postId}/comments`);
  };

  const handleProfileClick = (userId) => {
    if (isLoggedIn) {
      navigate(userId === currentUserId ? '/profile' : `/member/${userId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="posts-page">
      <Navbar isLoggedIn={isLoggedIn} onLogout={() => navigate('/login')} />

      <div className="posts-container">
        {loading ? (
          <p className="loading-text">กำลังโหลดโพสต์...</p>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                {post.user_id ? (
                  <div
                    onClick={() => handleProfileClick(post.user_id)}
                    className="post-profile-link"
                  >
                    <img
                      src={post.profile_picture || '/profileicon.png'}
                      alt={post.user_name}
                      className="post-profile-image"
                    />
                    <span className="post-user-name">{post.user_name}</span>
                  </div>
                ) : (
                  <div className="post-user-placeholder">
                    <img
                      src="/profileicon.png"
                      alt="Default Profile"
                      className="post-profile-image"
                    />
                    <span className="post-user-name">Unknown User</span>
                  </div>
                )}
              </div>

              {/* แสดงหัวข้อ */}
              <h2 className="post-title">{post.title}</h2>

              {/* แสดงเนื้อหา */}
              <p>{post.content}</p>

              {/* แสดงรูปภาพ (ถ้ามี) */}
              {post.image && <img src={post.image} alt="Post" className="post-image" />}

              <div className="post-actions">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`like-button ${post.isLiked ? 'liked' : ''}`}
                >
                  {post.isLiked ? '❤️' : '♡'} {post.likes_count || 0}
                </button>
                <button onClick={() => handleComment(post.id)}>
                  💬
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-posts-text">ยังไม่มีโพสต์ในขณะนี้</p>
        )}
      </div>

      {isLoggedIn && (
        <div className="create-post-btn-container">
          <Link to="/create" className="create-post-btn">
            โพสต์ ✍️
          </Link>
        </div>
      )}
    </div>
  );
};

export default Posts;
