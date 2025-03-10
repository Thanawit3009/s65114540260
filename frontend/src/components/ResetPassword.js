import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `http://localhost:8000/api/auth/password-reset-confirm/${uidb64}/${token}/`,
        { new_password: newPassword }
      );

      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000); // ✅ เปลี่ยนเส้นทางไป login
    } catch (err) {
      setError("เกิดข้อผิดพลาด หรือ Token หมดอายุ");
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h2>ตั้งรหัสผ่านใหม่</h2>
        <form onSubmit={handleSubmit}>
          <label>รหัสผ่านใหม่</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="กรอกรหัสผ่านใหม่"
            required
          />
          <button type="submit">เปลี่ยนรหัสผ่าน</button>
        </form>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
