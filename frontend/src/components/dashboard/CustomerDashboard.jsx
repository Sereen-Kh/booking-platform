import React, { useState, useEffect } from "react";
import { bookingsAPI, servicesAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard({ user }) {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsData, recommendedData] = await Promise.all([
                    bookingsAPI.getUserBookings(),
                    servicesAPI.getRecommended(3)
                ]);
                setBookings(bookingsData);
                setRecommended(recommendedData);
            } catch (error) {
                console.error("Failed to fetch customer data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="dashboard-content">
            <div className="welcome-section">
                <h2>Welcome back, {user?.full_name || "Customer"}! 👋</h2>
                <p className="user-email">Browse services and check your upcoming bookings.</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-icon">📅</div>
                    <h3>My Bookings</h3>
                    <p>You have {bookings.length} booking(s)</p>
                    <button className="card-btn" onClick={() => navigate("/bookings")}>View All</button>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon">❤️</div>
                    <h3>Favorites</h3>
                    <p>Managed your saved services</p>
                    <button className="card-btn" onClick={() => navigate("/favorites")}>View Favorites</button>
                </div>
            </div>

            <div className="info-section">
                <h3>🌟 Recommended for You</h3>
                <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
                    {recommended.map(service => (
                        <div key={service.id} className="dashboard-card">
                            <h3>{service.name}</h3>
                            <p>${service.price}</p>
                            <button className="card-btn" onClick={() => navigate(`/services/${service.id}`)}>
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
