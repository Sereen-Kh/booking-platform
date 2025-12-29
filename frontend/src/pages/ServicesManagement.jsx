import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { servicesAPI, authAPI } from "../utils/api.js";
import "../styles/ServicesManagement.css";
import { Edit2, Trash2, ExternalLink, Plus, Check, X } from "lucide-react";

export default function ServicesManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    category_id: "",
    image_url: ""
  });

  useEffect(() => {
    checkProviderRole();
    loadServices();
    loadCategories();
  }, []);

  const checkProviderRole = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      setCurrentUser(user);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        category_id: parseInt(formData.category_id)
      };

      if (editingId) {
        await servicesAPI.updateProviderService(editingId, serviceData);
      } else {
        await servicesAPI.createProviderService(serviceData);
      }

      resetForm();
      loadServices();
    } catch (err) {
      setError(editingId ? "Failed to update service" : "Failed to create service");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      category_id: service.category_id.toString(),
      image_url: service.image_url || ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    setLoading(true);
    try {
      await servicesAPI.deleteProviderService(id);
      loadServices();
    } catch (err) {
      setError("Failed to delete service");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration_minutes: "",
      category_id: "",
      image_url: ""
    });
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
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="services-management-page">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>Provider Dashboard</h1>
        </div>
        <div className="nav-menu">
          <Link to="/dashboard">Stats</Link>
          {currentUser && (
            <Link to={`/provider/${currentUser.id}`} className="view-shop-link">
              <ExternalLink className="w-4 h-4 mr-1" /> View My Shop
            </Link>
          )}
          <button
            className={`btn-toggle-form ${showForm ? 'btn-cancel' : 'btn-add'}`}
            onClick={() => showForm ? resetForm() : setShowForm(true)}
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "New Service"}
          </button>
        </div>
      </nav>

      <div className="services-content">
        {error && <div className="error-message">{error}</div>}

        {/* Form Section */}
        {showForm && (
          <div className="create-form-section animate-slide-down">
            <h2>{editingId ? "Edit Service" : "Create New Service"}</h2>
            <form onSubmit={handleSubmit} className="service-form">
              <div className="form-group">
                <label>Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Professional Haircut"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe what's included in this service..."
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
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Duration (min)</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    required
                    min="5"
                    step="5"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (editingId ? "Updating..." : "Creating...") : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editingId ? "Update Service" : "Create Service"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Section */}
        <div className="services-list-section">
          <div className="section-header">
            <h2>Your Active Services</h2>
            <div className="service-count">{services.length} Total</div>
          </div>

          {services.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <p>You haven't listed any services yet.</p>
              <button
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                Create Your First Service
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-card manage-card">
                  {service.image_url && (
                    <div className="service-image-header">
                      <img src={service.image_url} alt={service.name} />
                    </div>
                  )}
                  <div className="service-card-body">
                    <div className="service-header">
                      <h3>{service.name}</h3>
                      <span className="price">${service.price}</span>
                    </div>
                    <p className="description">{service.description}</p>
                    <div className="service-meta">
                      <span className="duration">⏱️ {service.duration_minutes} min</span>
                      <span className="category">
                        📁 {categories.find(c => c.id === service.category_id)?.name || "Category"}
                      </span>
                    </div>
                    <div className="manage-actions">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(service)}
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(service.id)}
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
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