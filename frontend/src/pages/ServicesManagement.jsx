import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { servicesAPI, authAPI } from "../utils/api.js";
import "../styles/ServicesManagement.css";

export default function ServicesManagement() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    category_id: ""
  });

  useEffect(() => {
    checkProviderRole();
    loadServices();
    loadCategories();
  }, []);

  const checkProviderRole = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      if (user.role !== "provider") {
        navigate("/dashboard");
      }
    } catch (err) {
      navigate("/login");
    }
  };

  const loadServices = async () => {
    try {
      const data = await servicesAPI.getProviderServices();
      setServices(data);
    } catch (err) {
      setError("Failed to load services");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/services/categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        category_id: parseInt(formData.category_id)
      };
      
      await servicesAPI.createProviderService(serviceData);
      setShowCreateForm(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        duration_minutes: "",
        category_id: ""
      });
      loadServices();
    } catch (err) {
      setError("Failed to create service");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading && services.length === 0) {
    return (
      <div className="services-management-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="services-management-page">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>My Services</h1>
        </div>
        <div className="nav-menu">
          <a href="/dashboard">Dashboard</a>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Cancel" : "+ New Service"}
          </button>
        </div>
      </nav>

      <div className="services-content">
        {error && <div className="error-message">{error}</div>}

        {/* Create Service Form */}
        {showCreateForm && (
          <div className="create-form-section">
            <h2>Create New Service</h2>
            <form onSubmit={handleCreateService} className="service-form">
              <div className="form-group">
                <label>Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Haircut, Massage"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe your service..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                  />
                </div>

                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    required
                    min="15"
                    step="15"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Service"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        <div className="services-list-section">
          <h2>Your Services ({services.length})</h2>
          
          {services.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any services yet.</p>
              <button 
                className="btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Service
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <h3>{service.name}</h3>
                    <span className="price">${service.price}</span>
                  </div>
                  <p className="description">{service.description}</p>
                  <div className="service-meta">
                    <span className="duration">⏱️ {service.duration_minutes} min</span>
                    <span className="category">
                      📁 {categories.find(c => c.id === service.category_id)?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="service-actions">
                    <button className="btn-small">Edit</button>
                    <button className="btn-small btn-danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}