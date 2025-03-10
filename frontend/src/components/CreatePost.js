import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreatePost.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบเพื่อโพสต์');
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบ');
      return;
    }

    const formData = new FormData();
    formData.append('title', title); // เพิ่ม title
    formData.append('content', content); // เพิ่ม content
    if (image) formData.append('image', image); // เพิ่ม image กรณีมีรูปภาพ

    axios
      .post('http://localhost:8000/api/community/posts/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('Post created successfully', response.data);
        navigate('/'); // กลับไปหน้าโพสต์
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          alert('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          console.error('Error creating post', error);
        }
      });
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <form onSubmit={handleSubmit}>
          <label>หัวข้อ</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เขียนหัวข้อ"
            required // บังคับให้กรอก
          />

          <label>เนื้อหา</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="เขียนเนื้อหา"
            required // บังคับให้กรอก
          ></textarea>

          <label>อัปโหลดรูปภาพ</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />

          <button type="submit">โพสต์</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
