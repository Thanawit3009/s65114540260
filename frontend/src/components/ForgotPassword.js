import React, { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/api/auth/password-reset/", {
        email,
      });

      setMessage(response.data.message || "โปรดตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน");
    } catch (err) {
      setError("ไม่พบอีเมลนี้ในระบบ หรือเกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h2>ลืมรหัสผ่าน</h2>
        <p>กรุณากรอกอีเมลของคุณ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล</p>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="กรอกอีเมลของคุณ"
            required
          />
          <button type="submit">ส่งคำขอรีเซ็ตรหัสผ่าน</button>
        </form>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
