import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { refreshAccessToken } from "../utils/auth";
import Navbar from "./Navbar";
import "./MemberCollectionPage.css";

const MemberCollectionPage = () => {
    const { memberId } = useParams();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No token found");
                }

                const response = await axios.get(
                    `http://localhost:8000/api/mycollections/members/${memberId}/collections/approved/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // ตรวจสอบว่า API ส่งข้อความแจ้งเตือนหรือไม่
                if (response.data.message === "คนนี้ยังไม่มีคอลเล็กชั่น") {
                    setCollections([]); // หากไม่มีคอลเล็กชั่น ตั้งค่าให้เป็นอาร์เรย์ว่าง
                } else {
                    setCollections(response.data); // ตั้งค่าคอลเล็กชั่นเมื่อมีข้อมูล
                }
            } catch (err) {
                console.error("Error fetching collections:", err);
                if (err.response?.status === 401) {
                    try {
                        const newToken = await refreshAccessToken();
                        const retryResponse = await axios.get(
                            `http://localhost:8000/api/mycollections/members/${memberId}/collections/approved/`,
                            {
                                headers: {
                                    Authorization: `Bearer ${newToken}`,
                                },
                            }
                        );

                        if (retryResponse.data.message === "คนนี้ยังไม่มีคอลเล็กชั่น") {
                            setCollections([]);
                        } else {
                            setCollections(retryResponse.data);
                        }
                    } catch (refreshError) {
                        setError("Session expired. Please log in again.");
                    }
                } else {
                    setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, [memberId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="member-collection-page">
            <Navbar />
            <div className="collections-container">
                <h1>Collections of Member</h1>
                {collections.length > 0 ? (
                    <div className="collections-grid">
                        {collections.map((collection) => (
                            <div key={collection.id} className="collection-card">
                                <img
                                    src={collection.image ? `http://localhost:8000${collection.image}` : "/default-collection.png"}
                                    alt={collection.name}
                                    className="collection-image"
                                />
                                <h2>{collection.name}</h2>
                                <p>{collection.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-collections">
                        <p>ยังไม่มีคอลเล็กชั่นสำหรับสมาชิกนี้</p>
                        <img
                            src="/no-collections-available.png"
                            alt="No collections available"
                            className="no-collections-image"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberCollectionPage;
