import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  console.log('Sidebar Component Rendered'); // ตรวจสอบว่า Sidebar ถูก Render

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/posts'; // ไปยังหน้าโพสต์สาธารณะ
  };

  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li>
          <NavLink
            to="/admin/overview"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            สรุปข้อมูล
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/collections"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            อนุญาตคอลเล็กชั่น
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/members"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            ตรวจสอบสมาชิก
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/news"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            จัดการข่าว
          </NavLink>
        </li>
      </ul>
      <button className="logout-button" onClick={handleLogout}>
        ออกจากระบบ
      </button>
    </div>
  );
};

export default Sidebar;
