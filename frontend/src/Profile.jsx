import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "./utils/api.js";
import "./Dashboard.css";

export default function Profile() {
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
          <h1>BookIt Profile</h1>
        </div>
        <div className="nav-menu">
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>👤 User Profile</h2>
        </div>

        <div className="dashboard-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="card-icon">👤</div>
          <h3>Profile Information</h3>
          
          <div style={{ textAlign: "left", marginTop: "2rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8 }}>
                Full Name
              </label>
              <div style={{ 
                background: "rgba(255, 255, 255, 0.1)", 
                padding: "0.75rem", 
                borderRadius: "8px" 
              }}>
                {user?.full_name}
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8 }}>
                Email Address
              </label>
              <div style={{ 
                background: "rgba(255, 255, 255, 0.1)", 
                padding: "0.75rem", 
                borderRadius: "8px" 
              }}>
                {user?.email}
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8 }}>
                Role
              </label>
              <div style={{ 
                background: "rgba(255, 255, 255, 0.1)", 
                padding: "0.75rem", 
                borderRadius: "8px",
                textTransform: "capitalize"
              }}>
                {user?.role}
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8 }}>
                Account Status
              </label>
              <div style={{ 
                background: "rgba(255, 255, 255, 0.1)", 
                padding: "0.75rem", 
                borderRadius: "8px" 
              }}>
                ✅ Active
              </div>
            </div>
          </div>

          <button className="card-btn" style={{ marginTop: "2rem" }}>
            Edit Profile (Coming Soon)
          </button>
        </div>

        <div className="info-section" style={{ marginTop: "2rem" }}>
          <h3>🔐 This is a Protected Page!</h3>
          <p>You can only access this page because you're logged in with a valid JWT token.</p>
        </div>
      </div>
    </div>
  );
}
