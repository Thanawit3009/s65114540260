import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './NewsPage.css';
import { refreshAccessToken } from '../utils/auth';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // ฟังก์ชันสำหรับดึงข่าวสาธารณะ
  const fetchPublicNews = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/news/public/');
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching public news:', error);
    }
  }, []); // ไม่มี dependency (ยังคงเหมือนเดิม)

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    fetchPublicNews(); // โหลดข่าวสาธารณะ
  }, [fetchPublicNews]); // เพิ่ม fetchPublicNews เป็น dependency

  // ฟังก์ชันสำหรับดึงข่าวที่ต้องใช้การล็อกอิน
  const fetchNews = useCallback(async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!token || !refreshToken) {
      console.warn('Token หรือ Refresh Token ไม่พบ');
      fetchPublicNews(); // โหลดข่าวสาธารณะ
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/news/protected/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNews(response.data); // อัปเดตข่าวที่ได้
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn('Token หมดอายุ, พยายามรีเฟรช Token');
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            const retryResponse = await axios.get('http://localhost:8000/api/news/protected/', {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            setNews(retryResponse.data); // อัปเดตข่าวที่รีเฟรชสำเร็จ
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          handleLogout(); // ลบ token
          fetchPublicNews(); // โหลดข่าวสาธารณะ
        }
      } else {
        console.error('Error fetching news:', error);
        fetchPublicNews(); // โหลดข่าวสาธารณะ
      }
    }
  }, [fetchPublicNews, handleLogout]); // เพิ่ม handleLogout ใน dependency array

  // useEffect สำหรับโหลดข่าว
  useEffect(() => {
    if (isLoggedIn) {
      fetchNews();
    } else {
      fetchPublicNews();
    }
  }, [isLoggedIn, fetchNews, fetchPublicNews]); // ใช้ dependencies ที่ถูกต้อง

  return (
    <div className="news-page">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="news-page-container">
        <h1>ข่าวสารล่าสุด</h1>
        <div className="news-list">
          {news.map((item) => (
            <div key={item.id} className="news-item">
              <img
                src={item.image}
                alt={item.title}
                className="news-image"
                style={{ width: '400px', height: '300px', objectFit: 'cover' }} // ขยายรูปโดยตรง
              />
              <div className="news-details">
                <h2>{item.title}</h2>
                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;

