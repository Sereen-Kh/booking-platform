import React, { useState, useEffect } from "react";
import { bookingsAPI, servicesAPI, adminAPI } from "../../utils/api"; // adminAPI might be needed if update provider stats logic there, but standard calls work
import { useNavigate } from "react-router-dom";

// Note: adminAPI.getStats() is for system-wide. Provider needs their own stats.
// We can derive stats from the lists for now.

export default function ProviderDashboard({ user }) {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsData, servicesData] = await Promise.all([
                    bookingsAPI.getProviderBookings(),
                    servicesAPI.getProviderServices()
                ]);
                setBookings(bookingsData);
                setServices(servicesData);
            } catch (error) {
                console.error("Failed to fetch provider data:", error);
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
                <h2>Provider Dashboard: {user?.full_name}</h2>
                <p className="user-role"><span className="badge">Provider</span></p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-icon">🛠️</div>
                    <h3>My Services</h3>
                    <p>{services.length} Active Services</p>
                    <button className="card-btn" onClick={() => navigate("/provider/services")}>
                        Manage Services
                    </button>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon">📦</div>
                    <h3>Orders</h3>
                    <p>{bookings.length} Total Orders</p>
                    <button className="card-btn">View Orders</button>
                </div>
            </div>

            <div className="info-section">
                <h3>Recent Orders</h3>
                {bookings.length === 0 ? (
                    <p>No orders yet.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {bookings.slice(0, 5).map(booking => (
                            <li key={booking.id} style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '1rem',
                                marginBottom: '0.5rem',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>Booking #{booking.id}</span>
                                <span>{new Date(booking.start_time).toLocaleDateString()}</span>
                                <span className="badge">{booking.status}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
