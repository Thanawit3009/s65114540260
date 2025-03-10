import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './NewsManagement.css';
import { refreshAccessToken } from '../utils/auth';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [editingNews, setEditingNews] = useState(null); // สำหรับเก็บข่าวที่กำลังแก้ไข
  const [newNews, setNewNews] = useState({ title: '', content: '', image: null });

  console.log('NewsManagement Component Rendered');


  // ฟังก์ชันดึงข้อมูลข่าว
  const fetchNews = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/news/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched news:', response.data); // เพิ่ม Log ตรงนี้
      setNews(response.data);
      setNews(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          const retryResponse = await axios.get('http://localhost:8000/api/news/', {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          setNews(retryResponse.data);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          alert('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        console.error('Error fetching news:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setNewNews({ title: newsItem.title, content: newsItem.content, image: null });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newNews.title);
    formData.append('content', newNews.content);
    if (newNews.image) formData.append('image', newNews.image);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/news/${editingNews.id}/`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setEditingNews(null);
      setNewNews({ title: '', content: '', image: null });
      await fetchNews(); // เรียก fetchNews หลังจากแก้ไขข่าว
    } catch (error) {
      console.error('Error updating news:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/news/${id}/delete/`, {  // ตรวจสอบ URL ตรงนี้
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchNews(); // โหลดข่าวใหม่หลังลบสำเร็จ
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('ไม่สามารถลบข่าวได้: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newNews.title);
    formData.append('content', newNews.content);
    if (newNews.image) formData.append('image', newNews.image);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/news/', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setNews([...news, response.data]);
      setNewNews({ title: '', content: '', image: null }); // รีเซ็ตฟอร์ม
    } catch (error) {
      console.error('Error creating news:', error);
    }
  };

  return (
    <div className="news-management-container">
      <h1>ข่าว</h1>

      {/* แบบฟอร์มเพิ่มหรือแก้ไขข่าว */}
      <form onSubmit={editingNews ? handleUpdate : handleCreate} className="news-form">
        <input
          type="text"
          placeholder="หัวข้อ"
          value={newNews.title}
          onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
        />
        <textarea
          placeholder="เนื้อหา"
          value={newNews.content}
          onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
        />
        <input
          type="file"
          onChange={(e) => setNewNews({ ...newNews, image: e.target.files[0] })}
        />
        <button type="submit">{editingNews ? 'อัปเดตข่าว' : 'เพิ่มข่าว'}</button>
        {editingNews && (
          <button type="button" onClick={() => setEditingNews(null)}>
            ยกเลิก
          </button>
        )}
      </form>

      {/* รายการข่าว */}
      <div className="news-list">
        {news.map((item) => (
          <div key={item.id} className="news-item">
            <img src={item.image} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.content}</p>
            <button onClick={() => handleEdit(item)}>แก้ไข</button>
            <button onClick={() => handleDelete(item.id)}>ลบ</button>
          </div>
        ))}
      </div>
    </div>
  );

};

export default NewsManagement;
