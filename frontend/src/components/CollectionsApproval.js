import React, { useState, useEffect, useCallback, useRef } from "react";
import { refreshAccessToken, isAdmin } from "../utils/auth";
import { BrowserQRCodeReader } from "@zxing/browser";
import "./CollectionsApproval.css";

const CollectionsApproval = () => {
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState({});

  const fetchPendingCollections = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found. Please log in again.");

      const response = await fetch("http://localhost:8000/api/mycollections/admin/collections/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        console.log("Token expired. Refreshing...");
        await refreshAccessToken();
        return fetchPendingCollections();
      }

      if (!response.ok) throw new Error(`Failed to fetch collections. Status: ${response.status}`);

      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError({ global: "เกิดข้อผิดพลาดในการดึงข้อมูลคอลเล็กชัน" });
    }
  }, []);

  useEffect(() => {
    if (!isAdmin()) {
      console.error("Unauthorized: User is not an admin.");
      setError({ global: "คุณไม่ได้รับอนุญาตให้ดูข้อมูลนี้" });
      return;
    }
    fetchPendingCollections();
  }, [fetchPendingCollections]);

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

      if (!response.ok) throw new Error(`Failed to approve collection. Status: ${response.status}`);

      alert("อนุมัติคอลเล็กชันสำเร็จ");
      fetchPendingCollections();
    } catch (error) {
      console.error("Error approving collection:", error);
      setError({ global: "เกิดข้อผิดพลาดในการอนุมัติคอลเล็กชัน" });
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

      if (!response.ok) throw new Error(`Failed to reject collection. Status: ${response.status}`);

      alert("ปฏิเสธคอลเล็กชันสำเร็จ");
      fetchPendingCollections();
    } catch (error) {
      console.error("Error rejecting collection:", error);
      setError({ global: "เกิดข้อผิดพลาดในการปฏิเสธคอลเล็กชัน" });
    }
  };

  return (
    <div className="collections-approval">
      <h1>คอลเล็กชันที่รอการอนุมัติ</h1>
      {error.global && <p className="error">{error.global}</p>}
      <table>
        <thead>
          <tr>
            <th>ชื่อคอลเล็กชัน</th>
            <th>รูปคอลเล็กชัน</th>
            <th colSpan={2}>QR Code + URL</th>
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
                <td colSpan={2}>
                  <QRDisplayAndScan qrUrl={`http://localhost:8000${collection.qr_code}`} />
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
              <td colSpan="7" style={{ textAlign: "center" }}>
                ไม่มีคอลเล็กชันที่ต้องตรวจสอบ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const QRDisplayAndScan = ({ qrUrl }) => {
  const imgRef = useRef(null);
  const [qrResult, setQrResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();

    const scan = async () => {
      try {
        const result = await codeReader.decodeFromImageElement(imgRef.current);
        setQrResult(result.getText());
        setError("");
      } catch (err) {
        console.error("QR scan error:", err.message);
        setQrResult("");
        setError("ไม่สามารถอ่าน QR ได้");
      }
    };

    if (imgRef.current) {
      if (imgRef.current.complete) {
        scan();
      } else {
        imgRef.current.onload = scan;
      }
    }
  }, [qrUrl]);

  return (
    <div style={{ fontSize: "13px", textAlign: "center" }}>
      <img
        ref={imgRef}
        src={qrUrl}
        crossOrigin="anonymous" // ✅ สำคัญมากสำหรับการสแกนภาพข้าม origin
        alt="QR Code"
        style={{ maxWidth: "120px" }}
        onError={(e) => (e.target.src = "default-qr-code.jpg")}
      />
      <div style={{ marginTop: "5px" }}>
        <strong>QR ลิงก์:</strong>{" "}
        {qrResult ? (
          <a href={qrResult} target="_blank" rel="noreferrer">
            {qrResult}
          </a>
        ) : (
          <span>{error || "กำลังสแกน..."}</span>
        )}
      </div>
    </div>
  );

};

export default CollectionsApproval;
