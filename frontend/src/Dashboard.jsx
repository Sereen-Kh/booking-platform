import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "./utils/api.js";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import ProviderDashboard from "./components/dashboard/ProviderDashboard";
import CustomerDashboard from "./components/dashboard/CustomerDashboard";
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

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'provider':
        return <ProviderDashboard user={user} />;
      case 'customer':
      default:
        return <CustomerDashboard user={user} />;
    }
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>BookIt {user?.role === 'admin' ? 'Admin' : 'Dashboard'}</h1>
        </div>
        <div className="nav-menu">
          <a href="/">Home</a>
          <a href="/profile">Profile</a>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      {renderDashboardContent()}
    </div>
  );
}
