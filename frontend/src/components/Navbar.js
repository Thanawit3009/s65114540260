import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MessageDropdown from "./MessageDropdown";
import "./Navbar.css";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("token");

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const toggleMessageDropdown = () => setIsMessageOpen(!isMessageOpen);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/collection?search=${searchQuery}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        navigate("/collection");
    };

    return (
        <div className="navbar">
            <button className="hamburger-btn" onClick={toggleMenu}>☰</button>
            <Link to="/" className="logo">
                <img src="/logo.png" alt="Logo" />
            </Link>
            <div className="nav-links">
                <Link to="/posts">community</Link>
                <Link to="/collection">collection</Link>
                <Link to="/news">news</Link>
            </div>
            <div className="search">
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-btn" onClick={handleSearch}>
                    <img src="/searchicon.png" alt="Search Icon" className="search-icon" />
                </button>
            </div>
            {isLoggedIn && (
                <div className="nav-icons">
                    <Link to="/profile">
                        <img src="/profileicon.png" alt="Profile" />
                    </Link>
                    {/* ✅ คลิกไอคอนนี้เพื่อแสดง MessageDropdown */}
                    <div className="message-dropdown-container">
                        <button className="message-icon-btn" onClick={toggleMessageDropdown}>
                            <img src="/messageicon.png" alt="Messages" />
                        </button>
                        <MessageDropdown isOpen={isMessageOpen} toggleDropdown={setIsMessageOpen} />
                    </div>
                </div>
            )}
            {menuOpen && (
                <div className="hamburger-menu">
                    <button className="close-btn" onClick={toggleMenu}>✕</button>
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" className="menu-link" onClick={toggleMenu}>
                                ข้อมูลผู้ใช้งาน
                            </Link>
                            <Link to="/my-collections" className="menu-link" onClick={toggleMenu}>
                                คอลเล็กชั่นของฉัน
                            </Link>
                            <button className="logout-btn" onClick={handleLogout}>ออกจากระบบ</button>
                        </>
                    ) : (
                        <Link to="/login" className="login-btn" onClick={toggleMenu}>
                            เข้าสู่ระบบ
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;
