import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './PublicCollectionsPage.css';
import { useSearchParams, useNavigate } from 'react-router-dom'; // ใช้ useNavigate สำหรับเปลี่ยนหน้า

const PublicCollectionsPage = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [searchParams] = useSearchParams(); // ดึงพารามิเตอร์จาก URL

  const fetchPublicCollections = async () => {
    try {
      const headers = {
        Accept: "application/json",
      };

      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8000/api/mycollections/collections/shared/", { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let data = await response.json();

      // ✅ เรียงลำดับให้รายการใหม่อยู่บนสุด
      data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setCollections(data);
    } catch (error) {
      console.error("Error fetching shared collections:", error);
    }
  };


  useEffect(() => {
    fetchPublicCollections();
  }, []);

  useEffect(() => {
    const query = searchParams.get('search') || ''; // ดึงค่า `search` จาก URL
    const results = collections
      .filter((collection) =>
        collection.name.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // ✅ เรียงลำดับอีกครั้งในกรณีค้นหา

    setFilteredCollections(results);
  }, [searchParams, collections]);


  const handleProfileClick = (userId) => {
    const currentUserId = localStorage.getItem('user_id'); // ดึง user_id ของผู้ใช้ปัจจุบันจาก localStorage
    console.log("Navigating to profile of user ID:", userId); 
  
    if (!isLoggedIn) {
      navigate('/login'); // ถ้าไม่ได้ล็อกอินให้ไปที่หน้า Login
      return;
    }
  
    if (userId && userId.toString() === currentUserId) {
      navigate('/profile'); // ✅ ถ้าคลิกโปรไฟล์ตัวเองให้ไปที่หน้า /profile
    } else {
      navigate(`/member/${userId}`); // ✅ ถ้าคลิกโปรไฟล์คนอื่นให้ไปที่ /member/{userId}
    }
  };
  
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    window.location.reload();
  };

  return (
    <div className="public-collections-page">
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
      <h1>คอลเล็กชั่น</h1>
      <div className="collections-list">
        {filteredCollections.length > 0 ? (
          filteredCollections.map((collection) => {
            console.log("User Data:", collection.user); // ✅ ตรวจสอบข้อมูลของ user
            console.log("Profile Image URL:", collection.user.profile_picture); // ✅ ตรวจสอบ URL ของรูป

            return (
              <div key={collection.id} className="collection-card">
                <div className="collection-header">
                  {/* 🔹 เพิ่มรูปโปรไฟล์และทำให้คลิกได้ */}
                  <div
                    className="collection-profile"
                    onClick={() => handleProfileClick(collection.user.id)} // ✅ ใช้ collection.user.id
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <img
                      src={collection.user.profile_picture || "/profileicon.png"}
                      alt="Profile"
                      className="collection-profile-image"
                      onError={(e) => { e.target.src = "/profileicon.png"; }}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    <span className="collection-user-name">
                      {collection.user.first_name || 'ไม่ระบุ'} {collection.user.last_name || ''}
                    </span>
                  </div>

                </div>
                <h2>{collection.name || 'ไม่มีข้อมูลชื่อคอลเล็กชั่น'}</h2>
                <p>{collection.description || 'ไม่มีคำอธิบาย'}</p>
                {collection.image && (
                  <img
                    src={collection.image}
                    alt={collection.name || 'คอลเล็กชั่น'}
                    className="collection-image"
                  />
                )}
              </div>
            );
          })
        ) : (
          <p>ไม่พบคอลเล็กชั่นที่ค้นหา</p>
        )}
      </div>
    </div>
  );

};

export default PublicCollectionsPage;
