import React, { useState, useEffect } from "react";
import { adminAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard({ user }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, providers
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersList = async (role = null) => {
        try {
            setLoading(true);
            const data = await adminAPI.getUsers(role);
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'users') fetchUsersList('customer'); // Default to customers
        if (tab === 'providers') fetchUsersList('provider');
        if (tab === 'overview') fetchStats();
    };

    if (loading && !stats && users.length === 0) return <div className="loading">Loading admin panel...</div>;

    return (
        <div className="dashboard-content">
            <div className="welcome-section">
                <h2>Admin Panel</h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        className={`card-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        style={{ width: 'auto', background: activeTab === 'overview' ? 'white' : 'rgba(255,255,255,0.2)' }}
                        onClick={() => handleTabChange('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`card-btn ${activeTab === 'users' ? 'active' : ''}`}
                        style={{ width: 'auto', background: activeTab === 'users' ? 'white' : 'rgba(255,255,255,0.2)' }}
                        onClick={() => handleTabChange('users')}
                    >
                        Customers
                    </button>
                    <button
                        className={`card-btn ${activeTab === 'providers' ? 'active' : ''}`}
                        style={{ width: 'auto', background: activeTab === 'providers' ? 'white' : 'rgba(255,255,255,0.2)' }}
                        onClick={() => handleTabChange('providers')}
                    >
                        Providers
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && stats && (
                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Total Customers</h3>
                        <p className="card-icon">{stats.customers}</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Total Providers</h3>
                        <p className="card-icon">{stats.providers}</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Active Services</h3>
                        <p className="card-icon">{stats.services}</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Total Bookings</h3>
                        <p className="card-icon">{stats.bookings}</p>
                    </div>
                </div>
            )}

            {(activeTab === 'users' || activeTab === 'providers') && (
                <div className="info-section">
                    <h3>{activeTab === 'users' ? 'Registered Customers' : 'Service Providers'}</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                <th style={{ padding: '0.5rem' }}>ID</th>
                                <th style={{ padding: '0.5rem' }}>Name</th>
                                <th style={{ padding: '0.5rem' }}>Email</th>
                                <th style={{ padding: '0.5rem' }}>Joined</th>
                                <th style={{ padding: '0.5rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <td style={{ padding: '0.5rem' }}>{u.id}</td>
                                    <td style={{ padding: '0.5rem' }}>{u.full_name}</td>
                                    <td style={{ padding: '0.5rem' }}>{u.email}</td>
                                    <td style={{ padding: '0.5rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <button style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
