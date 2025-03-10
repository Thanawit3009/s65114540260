import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import './ReviewPage.css';

const ReviewPage = () => {
    const { userId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [reviewedUserName, setReviewedUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReviewedUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8000/api/member/${userId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReviewedUserName(`${response.data.first_name} ${response.data.last_name}`);
        } catch (err) {
            console.error('Error fetching reviewed user:', err.message);
            setReviewedUserName('Unknown User');
        }
    }, [userId]);

    const fetchReviews = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8000/api/community/reviews/${userId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReviews(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching reviews:', err.message);
            setError(err.message);
            setLoading(false);
        }
    }, [userId]);

    const handleReviewSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!newReview.trim()) return alert("Review cannot be empty.");
            const response = await axios.post(
                `http://localhost:8000/api/community/reviews/${userId}/`,
                { review_text: newReview },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviews([...reviews, response.data]);
            setNewReview('');
        } catch (err) {
            console.error('Error submitting review:', err.message);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchReviewedUser();
        fetchReviews();
    }, [fetchReviewedUser, fetchReviews]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="review-page">
            <Navbar />
            <div className="reviews-container">
                <h1>Reviews for {reviewedUserName}</h1>
                <div className="review-list">
                    {reviews.map((review) => (
                        <div key={review.review_id} className="review-card">
                            <div className="review-header">
                                <img src={review.reviewer_profile_picture || '/default-profile.png'} alt="Profile" />
                                <span>{review.reviewer_name}</span>
                            </div>
                            <p>{review.review_text}</p>
                        </div>
                    ))}
                </div>
                <div className="add-review">
                    <textarea
                        placeholder="Write a review..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                    />
                    <button onClick={handleReviewSubmit}>Submit</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewPage;
