import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './EditPost.css'; // สร้างไฟล์ CSS ใหม่

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:8000/api/community/posts/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          title: response.data.title || '',
          content: response.data.content || '',
        });
        setLoading(false);
      } catch (error) {
        console.error('ไม่สามารถโหลดโพสต์ได้:', error.message);
        alert('เกิดข้อผิดพลาดในการโหลดโพสต์');
        navigate('/');
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.put(`http://localhost:8000/api/community/posts/${id}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('แก้ไขโพสต์สำเร็จ!');
      navigate('/');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการแก้ไข:', error.message);
      alert('ไม่สามารถแก้ไขโพสต์ได้');
    }
  };

  return (
    <div className="edit-post-page">
      <div className="edit-post-container">
        <h2 className="edit-post-title">✏️ แก้ไขโพสต์</h2>

        {loading ? (
          <p className="loading-text">กำลังโหลดข้อมูล...</p>
        ) : (
          <form onSubmit={handleSubmit} className="edit-post-form">
            <label>หัวข้อโพสต์</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="หัวข้อโพสต์"
            />

            <label>เนื้อหา</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              required
              placeholder="เขียนเนื้อหาโพสต์ของคุณ..."
            />

            <button type="submit" className="save-btn">💾 บันทึกการแก้ไข</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/')}>❌ ยกเลิก</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditPost;
