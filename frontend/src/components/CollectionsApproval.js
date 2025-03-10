import React, { useState, useEffect, useCallback } from "react";
import { refreshAccessToken, isAdmin } from "../utils/auth";
import "./CollectionsApproval.css";

const CollectionsApproval = () => {
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState("");

  // ใช้ useCallback เพื่อแก้ไขปัญหา dependencies ใน useEffect
  const fetchPendingCollections = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in again.");
      }

      const response = await fetch("http://localhost:8000/api/mycollections/admin/collections/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        console.log("Token expired. Refreshing...");
        await refreshAccessToken(); // Refresh Token
        return fetchPendingCollections(); // Retry
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch collections. Status: ${response.status}`);
      }

      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลคอลเล็กชัน");
    }
  }, []); // ไม่ใส่ dependencies ที่เปลี่ยนบ่อย

  useEffect(() => {
    if (!isAdmin()) {
      console.error("Unauthorized: User is not an admin.");
      setError("คุณไม่ได้รับอนุญาตให้ดูข้อมูลนี้");
      return;
    }
    fetchPendingCollections();
  }, [fetchPendingCollections]); // เพิ่ม fetchPendingCollections เป็น dependency

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/mycollections/admin/collections/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to approve collection. Status: ${response.status}`);
      }

      alert("อนุมัติคอลเล็กชันสำเร็จ");
      fetchPendingCollections();
    } catch (error) {
      console.error("Error approving collection:", error);
      setError("เกิดข้อผิดพลาดในการอนุมัติคอลเล็กชัน");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/mycollections/admin/collections/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reject collection. Status: ${response.status}`);
      }

      alert("ปฏิเสธคอลเล็กชันสำเร็จ");
      fetchPendingCollections();
    } catch (error) {
      console.error("Error rejecting collection:", error);
      setError("เกิดข้อผิดพลาดในการปฏิเสธคอลเล็กชัน");
    }
  };

  return (
    <div className="collections-approval">
      <h1>คอลเล็กชันที่รอการอนุมัติ</h1>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>ชื่อคอลเล็กชัน</th>
            <th>รูปคอลเล็กชัน</th>
            <th>รูป QR Code</th>
            <th>ข้อความ ID บรรทัดบน</th>
            <th>ข้อความ ID บรรทัดล่าง</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {collections.length > 0 ? (
            collections.map((collection) => (
              <tr key={collection.id}>
                <td>{collection.name || "ไม่มีข้อมูล"}</td>
                <td>
                  <img
                    src={`http://localhost:8000${collection.image}`}
                    alt={`รูป ${collection.name}`}
                    className="collection-image"
                    onError={(e) => (e.target.src = "default-collection.jpg")}
                  />
                </td>
                <td>
                  <img
                    src={`http://localhost:8000${collection.qr_code}`}
                    alt="QR Code"
                    className="qr-code-image"
                    onError={(e) => (e.target.src = "default-qr-code.jpg")}
                  />
                </td>
                <td>{collection.topMessage || "ไม่มีข้อความ"}</td>
                <td>{collection.bottomMessage || "ไม่มีข้อความ"}</td>
                <td>
                  <button className="approve-button" onClick={() => handleApprove(collection.id)}>
                    อนุมัติ
                  </button>
                  <button className="reject-button" onClick={() => handleReject(collection.id)}>
                    ปฏิเสธ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                ไม่มีคอลเล็กชันที่ต้องตรวจสอบ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CollectionsApproval;
