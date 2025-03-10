import React, { useState, useEffect } from "react";
import "./MemberManagement.css";

const MemberManagement = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch Members
    const fetchMembers = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token"); // ตรวจสอบว่ามีการเก็บ Token
            if (!token) {
                throw new Error("Token not found. Please log in again.");
            }

            const response = await fetch("http://localhost:8000/api/members/", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`, // ส่ง Token ใน Header
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setMembers(data); // บันทึกข้อมูลสมาชิก
        } catch (error) {
            console.error("Error fetching members:", error);
            setError("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก");
        } finally {
            setLoading(false);
        }
    };

    // Delete Member
    const deleteMember = async (id) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกคนนี้?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/members/${id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 204) {
                alert("ลบสมาชิกสำเร็จ!");
                setMembers((prevMembers) => prevMembers.filter((member) => member.id !== id)); // อัปเดตรายการสมาชิก
            } else {
                throw new Error("Failed to delete member");
            }
        } catch (err) {
            console.error("Error deleting member:", err);
            alert("เกิดข้อผิดพลาดในการลบสมาชิก");
        }
    };

    // Load Members on Component Mount
    useEffect(() => {
        fetchMembers();
    }, []);

    return (
        <div className="member-management">
            <h1>จัดการสมาชิก</h1>

            {loading && <p>กำลังโหลดข้อมูลสมาชิก...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && (
                <>
                    {members.length > 0 ? (
                        <table className="member-table">
                            <thead>
                                <tr>
                                    <th>ลำดับ</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>เบอร์</th>
                                    <th>อีเมล</th>
                                    <th>การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member, index) => (
                                    <tr key={member.id}>
                                        <td>{index + 1}</td>
                                        <td>{`${member.first_name} ${member.last_name}`}</td>
                                        <td>{member.phone_number || "N/A"}</td>
                                        <td>{member.email}</td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteMember(member.id)}
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>ไม่มีข้อมูลสมาชิก</p>
                    )}
                </>
            )}
        </div>
    );
};

export default MemberManagement;
