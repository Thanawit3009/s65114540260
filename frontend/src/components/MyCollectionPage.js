import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { refreshAccessToken } from "../utils/auth";
import Navbar from './Navbar';
import "./MyCollectionPage.css";

const MyCollectionPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    qr_code: null, // เปลี่ยนจาก qrCode เป็น qr_code
    topMessage: "",
    bottomMessage: "",
  });
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch approved collections
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in again.");
      }

      const response = await fetch(
        "http://localhost:8000/api/mycollections/collections/approved/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401) {
        console.log("Token expired. Refreshing...");
        token = await refreshAccessToken();
        const retryResponse = await fetch(
          "http://localhost:8000/api/mycollections/collections/approved/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!retryResponse.ok) {
          throw new Error(`HTTP error! Status: ${retryResponse.status}`);
        }

        const data = await retryResponse.json();
        setCollections(data);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลคอลเล็กชัน");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:8000/api/mycollections/collections/${id}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete collection. Status: ${response.status}`);
      }

      alert("ลบคอลเล็กชันสำเร็จ");
      setCollections((prev) => prev.filter((collection) => collection.id !== id));
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("เกิดข้อผิดพลาดในการลบคอลเล็กชัน");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file changes
  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];

    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("image", formData.image);
    formDataToSend.append("qr_code", formData.qr_code); // ใช้ qr_code
    formDataToSend.append("topMessage", formData.topMessage);
    formDataToSend.append("bottomMessage", formData.bottomMessage);

    try {
      let token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in again.");
      }

      const response = await fetch(
        "http://localhost:8000/api/mycollections/collections/request/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (response.status === 401) {
        console.log("Token expired while submitting. Refreshing...");
        token = await refreshAccessToken();
        const retryResponse = await fetch(
          "http://localhost:8000/api/mycollections/collections/request/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataToSend,
          }
        );

        if (!retryResponse.ok) {
          throw new Error(`Failed to submit collection request. Status: ${retryResponse.status}`);
        }
        alert("คำขอของคุณถูกส่งไปยังแอดมินแล้ว");
        await fetchCollections();
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to submit collection request. Status: ${response.status}`);
      }

      alert("คำขอของคุณถูกส่งไปยังแอดมินแล้ว");
      setFormVisible(false);
      setFormData({
        name: "",
        description: "",
        image: null,
        qr_code: null,
        topMessage: "",
        bottomMessage: "",
      });

      await fetchCollections();

      // Navigate back to the main page
      navigate("/my-collections"); // แก้ path ให้ตรงกับ routing ของคุณ
    } catch (error) {
      console.error("Error submitting collection request:", error);
      alert("เกิดข้อผิดพลาดในการส่งคำขอ");
    }
  };

  const handleShare = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:8000/api/mycollections/collections/${id}/share/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to share collection. Status: ${response.status}`);
      }

      alert("แชร์คอลเล็กชันสำเร็จ");
      fetchCollections();
    } catch (error) {
      console.error("Error sharing collection:", error);
      alert("เกิดข้อผิดพลาดในการแชร์คอลเล็กชัน");
    }
  };

  const handleUnshare = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:8000/api/mycollections/collections/${id}/unshare/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to unshare collection. Status: ${response.status}`);
      }

      alert("ยกเลิกแชร์คอลเล็กชันสำเร็จ");
      fetchCollections();
    } catch (error) {
      console.error("Error unsharing collection:", error);
      alert("เกิดข้อผิดพลาดในการยกเลิกแชร์คอลเล็กชัน");
    }
  };

  const handleEdit = async (id, newName) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:8000/api/mycollections/collections/${id}/edit/`, // URL สำหรับแก้ไข
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName }), // ส่งชื่อใหม่
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to edit collection. Status: ${response.status}`);
      }

      alert("แก้ไขชื่อสำเร็จ");
      await fetchCollections(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Error editing collection:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขชื่อคอลเล็กชัน");
    }
  };


  return (
    <div className="my-collection-page">
      {/* ใช้ Navbar ในส่วนนี้ */}
      <Navbar />
      <h1>My Collection</h1>
      <div className="buttons">
        <button onClick={() => setFormVisible(true)}>เพิ่มคอลเล็กชัน</button>
      </div>
      {formVisible ? (
        <form className="collection-form" onSubmit={handleSubmit}>
          <div>
            <label>ชื่อคอลเล็กชัน</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>คำอธิบาย</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>เพิ่มรูปคอลเล็กชัน</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              required
            />
          </div>
          <div>
            <label>เพิ่ม QR Code</label>
            <input
              type="file"
              name="qr_code" // ใช้ qr_code
              onChange={handleFileChange}
              required
            />
          </div>
          <div>
            <label>ข้อความ ID บรรทัดบน</label>
            <input
              type="text"
              name="topMessage"
              value={formData.topMessage}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>ข้อความ ID บรรทัดล่าง</label>
            <input
              type="text"
              name="bottomMessage"
              value={formData.bottomMessage}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">ยืนยัน</button>
          <button type="button" onClick={() => setFormVisible(false)}>
            ยกเลิก
          </button>
        </form>
      ) : (
        <div>
          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : collections.length > 0 ? (
            <div className="collections-list">
              {collections.map((collection) => (
                <div key={collection.id} className="collection-card">
                  <img
                    src={collection.image ? `http://localhost:8000${collection.image}` : "default-collection.jpg"}
                    alt={collection.name}
                    onError={(e) => (e.target.src = "default-collection.jpg")} // ใช้รูปภาพสำรองเมื่อโหลดไม่ได้
                  />
                  <h2>{collection.name}</h2>
                  <p>{collection.description}</p>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(collection.id)} // เรียกฟังก์ชันลบ
                  >
                    ลบคอลเล็กชัน
                  </button>
                  <button
                    className="share-button"
                    onClick={() => handleShare(collection.id)}
                  >
                    แชร์
                  </button>
                  <button
                    className="unshare-button"
                    onClick={() => handleUnshare(collection.id)}
                  >
                    ยกเลิกแชร์
                  </button>
                  <button
                    className="edit-button"
                    onClick={() => {
                      const newName = prompt("กรุณาใส่ชื่อใหม่ของคอลเล็กชัน:");
                      if (newName) {
                        handleEdit(collection.id, newName);
                      }
                    }}
                  >
                    แก้ไขชื่อ
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>ไม่มีข้อมูลคอลเล็กชัน กรุณาเพิ่มข้อมูล</p>
          )}
        </div>
      )}
    </div>
  );
};
export default MyCollectionPage;