import React from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const categories = [
    { name: "Hair & Beauty", icon: "✂️", color: "#FF6B9D" },
    { name: "Home Services", icon: "🏠", color: "#4ECDC4" },
    { name: "Health & Wellness", icon: "💪", color: "#95E1D3" },
    { name: "Tutoring", icon: "📚", color: "#FFD93D" },
    { name: "Personal Training", icon: "🏋️", color: "#6BCF7F" },
    { name: "Photography", icon: "📸", color: "#A8E6CF" },
  ];

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">📅</span>
            <span className="logo-text">BookIt</span>
          </div>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
          </div>
          <div className="auth-buttons">
            <button className="btn-login">Login</button>
            <button className="btn-register">Register</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Find & Book <span className="highlight">Services</span>
            <br />
            Near You
          </h1>
          <p className="hero-subtitle">
            Connect with trusted service providers in your area. Book appointments in seconds.
          </p>
          <div className="search-bar">
            <div className="search-input-wrapper">

              import { useNavigate } from "react-router-dom";
                placeholder="What service are you looking for?" 
                className="search-input"
              
            </div>
            <button className="search-button">Search</button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Users</span>

                const navigate = useNavigate();
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Service Providers</span>
                          <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
                          <button className="btn-register" onClick={() => navigate("/register")}>Register</button>
              <span className="stat-number">50K+</span>
              <span className="stat-label">Bookings Made</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Categories */}
      <section className="featured-section" id="services">
        <div className="section-container">
                          <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
                          <button className="btn-register" onClick={() => navigate("/register")}>Register</button>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="category-card"
                style={{ '--card-color': category.color }}
              >
                <div className="category-icon">{category.icon}</div>
                <h3 className="category-name">{category.name}</h3>
                <button className="category-btn">Browse →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in three simple steps</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
                        <div className="hero-stats">
                          <div className="stat">
                            <span className="stat-number">10K+</span>
                            <span className="stat-label">Active Users</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">500+</span>
                            <span className="stat-label">Service Providers</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">50K+</span>
                            <span className="stat-label">Bookings Made</span>
                          </div>
                        </div>
              <div className="step-number">3</div>
              <div className="step-icon">✅</div>
              <h3 className="step-title">Get Confirmation</h3>
              <p className="step-description">
                Receive instant confirmation and reminders for your appointment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Are you a service provider?</h2>
          <p className="cta-subtitle">Join our platform and grow your business</p>
          <button className="cta-button">Become a Provider</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>BookIt</h4>
            <p>Your trusted service booking platform</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
            <a href="#terms">Terms of Service</a>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#">Facebook</a>
              <a href="#">Twitter</a>
              <a href="#">Instagram</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 BookIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
