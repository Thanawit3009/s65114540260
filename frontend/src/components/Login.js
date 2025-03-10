import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email,
        password,
      });

      const { access, refresh, is_admin, user } = response.data;

      if (!user || !user.id) {
        throw new Error("User data is missing from response.");
      }

      // ✅ บันทึก token, refresh_token และ user_id ลง localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_id', user.id); // ✅ ตรวจสอบ user ก่อนใช้
      localStorage.setItem('is_admin', is_admin);

      console.log("✅ Login Success: User ID =", user.id); // Debug

      if (is_admin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true }); // ✅ ใช้ `from` เพื่อให้กลับไปหน้าที่ตั้งใจ
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        setError('เกิดข้อผิดพลาด: กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">เข้าสู่ระบบ</h1>
        <form onSubmit={handleLogin}>
          <label className="login-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="login-input"
            required
          />
          <label className="login-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="login-input"
            required
          />
          <button type="submit" className="login-button">เข้าสู่ระบบ</button>
          {error && <p className="error-text">{error}</p>} {/* แสดงข้อความแจ้งเตือน */}
        </form>

        <a href="/forgot-password" className="forgot-password-link">ลืมรหัสผ่าน?</a>
        <a href="/register" className="register-link">สมัครสมาชิก</a>
      </div>
    </div>
  );
};

export default Login;
