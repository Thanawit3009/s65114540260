import React, { useState, useEffect } from "react";
import { refreshAccessToken, isAdmin } from "../utils/auth";
import "./DashboardOverview.css"; // เพิ่มไฟล์ CSS สำหรับตกแต่ง

const DashboardOverview = () => {
    const [overviewData, setOverviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchOverviewData = async () => {
        setLoading(true);
        setError("");
        try {
            let token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token not found. Please log in again.");
            }

            if (!isAdmin()) {
                alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
                window.location.href = "/";
                return;
            }

            let response = await fetch("http://localhost:8000/api/community/dashboard/overview/", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (response.status === 401) {
                token = await refreshAccessToken();
                response = await fetch("http://localhost:8000/api/community/dashboard/overview/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setOverviewData(data);
        } catch (error) {
            console.error("Error fetching overview data:", error);
            setError("เกิดข้อผิดพลาดในการดึงข้อมูลสรุป");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverviewData();
    }, []);

    return (
        <div className="dashboard-overview">
            <h1 className="dashboard-title">Dashboard Overview</h1>

            {loading && <p>กำลังโหลดข้อมูล...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && overviewData && (
                <div className="overview-grid">
                    <div className="overview-card">
                        <h2 className="overview-number">{overviewData.posts_count}</h2>
                        <p className="overview-label">จำนวนโพสต์ทั้งหมด</p>
                    </div>
                    <div className="overview-card">
                        <h2 className="overview-number">{overviewData.comments_count}</h2>
                        <p className="overview-label">จำนวนคอมเมนต์ทั้งหมด</p>
                    </div>
                    <div className="overview-card">
                        <h2 className="overview-number">{overviewData.collections_count}</h2>
                        <p className="overview-label">จำนวนคอลเล็กชั่นทั้งหมด</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;
