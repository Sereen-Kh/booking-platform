import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "./utils/api.js";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError("Failed to load user data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>BookIt Dashboard</h1>
        </div>
        <div className="nav-menu">
          <a href="/">Home</a>
          <a href="/profile">Profile</a>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome back, {user?.full_name || "User"}! 👋</h2>
          <p className="user-role">
            Role: <span className="badge">{user?.role}</span>
          </p>
          <p className="user-email">Email: {user?.email}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">📅</div>
            <h3>My Bookings</h3>
            <p>View and manage your bookings</p>
            <button className="card-btn">View Bookings</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🔍</div>
            <h3>Browse Services</h3>
            <p>Find and book services</p>
            <button className="card-btn" onClick={() => navigate("/services")}>
              View Services
            </button>
          </div>

          {user?.role === "provider" && (
            <div className="dashboard-card">
              <div className="card-icon">🛠️</div>
              <h3>My Services</h3>
              <p>Manage services you offer</p>
              <button className="card-btn" onClick={() => navigate("/provider/services")}>
                Manage Services
              </button>
            </div>
          )}

          <div className="dashboard-card">
            <div className="card-icon">👤</div>
            <h3>Profile Settings</h3>
            <p>Update your profile information</p>
            <button className="card-btn" onClick={() => navigate("/profile")}>
              Edit Profile
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🔔</div>
            <h3>Notifications</h3>
            <p>Check your latest updates</p>
            <button className="card-btn">View Notifications</button>
          </div>
        </div>

        <div className="info-section">
          <h3>🎉 Your account is protected!</h3>
          <div className="security-features">
            <p>✅ JWT Token Authentication Active</p>
            <p>✅ Password Encrypted with Bcrypt</p>
            <p>✅ Protected Route - Login Required</p>
            <p>✅ Token Stored Securely in localStorage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
