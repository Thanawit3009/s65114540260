import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false); // เพิ่ม state เพื่อตรวจสอบสถานะการสมัคร
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    axios
      .post('http://localhost:8000/api/auth/register/', {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        email,
        password,
      })
      .then((response) => {
        console.log('User registered successfully', response.data);
        alert('สมัครสมาชิกสำเร็จ!');
        setIsRegistered(true); // ตั้งค่าสถานะการสมัครสำเร็จ
      })
      .catch((error) => {
        console.error('Error registering user', error);
        alert('การสมัครสมาชิกไม่สำเร็จ!');
      });
  };

  const goToLogin = () => {
    navigate('/login'); // ฟังก์ชันสำหรับนำไปหน้า Login
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-title">สมัครสมาชิก</h1>
        {isRegistered ? (
          <div className="success-container">
            <p>สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้ทันที</p>
            <button onClick={goToLogin} className="login-button">
              ไปยังหน้าล็อกอิน
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="register-row">
              <div className="register-column">
                <label>*ชื่อ</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="กรอกชื่อ"
                  required
                />
              </div>
              <div className="register-column">
                <label>*นามสกุล</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="กรอกนามสกุล"
                  required
                />
              </div>
            </div>
            <label>*เบอร์</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="กรอกเบอร์โทรศัพท์"
              required
            />
            <label>*Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมล"
              required
            />
            <label>*Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              required
            />
            <button type="submit" className="register-button">
              บันทึกข้อมูล
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
