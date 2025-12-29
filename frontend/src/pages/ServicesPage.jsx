import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { servicesAPI } from "../utils/api.js";
import "../styles/ServicesPage.css";

export default function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category_id: "",
    min_price: "",
    max_price: "",
    search: ""
  });

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  useEffect(() => {
    // Debounced search
    const timer = setTimeout(() => {
      loadServices();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category_id) params.append("category_id", filters.category_id);
      if (filters.min_price) params.append("min_price", filters.min_price);
      if (filters.max_price) params.append("max_price", filters.max_price);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(
        `http://localhost:8000/api/v1/services/?${params.toString()}`
      );
      const data = await response.json();
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

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      category_id: "",
      min_price: "",
      max_price: "",
      search: ""
    });
  };

  const handleBookService = (service) => {
    // Navigate to service detail page or show booking modal
    navigate(`/service/${service.id}`);
  };

  if (loading && services.length === 0) {
    return (
      <div className="services-page">
        <div className="loading">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <nav className="services-nav">
        <div className="nav-brand">
          <h1>Services</h1>
        </div>
        <div className="nav-menu">
          <a href="/dashboard">Dashboard</a>
          <a href="/">Home</a>
        </div>
      </nav>

      <div className="services-content">
        {/* Filters Section */}
        <div className="filters-section">
          <h2>Find the Perfect Service</h2>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search services..."
              />
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Min Price ($)</label>
              <input
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={handleFilterChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="filter-group">
              <label>Max Price ($)</label>
              <input
                type="number"
                name="max_price"
                value={filters.max_price}
                onChange={handleFilterChange}
                placeholder="1000"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {(filters.category_id || filters.min_price || filters.max_price || filters.search) && (
            <div className="filter-actions">
              <button className="btn-clear" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Services List */}
        <div className="services-list-section">
          <div className="section-header">
            <h2>Available Services ({services.length})</h2>
          </div>

          {services.length === 0 ? (
            <div className="empty-state">
              <p>No services found matching your criteria.</p>
              <button className="btn-primary" onClick={clearFilters}>
                Clear All Filters
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
                    <button 
                      className="btn-primary"
                      onClick={() => handleBookService(service)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Services (shown when no filters applied) */}
        {!filters.category_id && !filters.min_price && !filters.max_price && !filters.search && (
          <div className="recommended-section">
            <h2>Recommended Services</h2>
            <RecommendedServices />
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendedServices() {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecommended();
  }, []);

  const loadRecommended = async () => {
    try {
      const data = await servicesAPI.getRecommended(6);
      setRecommended(data);
    } catch (err) {
      console.error("Failed to load recommended services", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading recommendations...</div>;
  if (recommended.length === 0) return null;

  return (
    <div className="services-grid">
      {recommended.map((service) => (
        <div key={service.id} className="service-card featured">
          <div className="service-header">
            <h3>{service.name}</h3>
            <span className="price">${service.price}</span>
          </div>
          <p className="description">{service.description}</p>
          <div className="service-meta">
            <span className="duration">⏱️ {service.duration_minutes} min</span>
          </div>
          <div className="service-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate(`/service/${service.id}`)}
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}