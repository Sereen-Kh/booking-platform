import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "./utils/api.js";
import "./AuthPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer", // default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roles = [
    {
      value: "customer",
      icon: "👤",
      name: "Customer",
      desc: "Book services"
    },
    {
      value: "provider",
      icon: "💼",
      name: "Provider",
      desc: "Offer services"
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (formData.fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters");
      return false;
    }
    if (!formData.email) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role
      );
      
      setSuccess("Account created successfully! Redirecting to login...");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      if (err.message.includes("already exists")) {
        setError("An account with this email already exists. Please login instead.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    // Implement Google OAuth when backend is ready
    alert("Google OAuth integration coming soon!\n\nFor now, please use email/password registration.");
    
    // When ready, redirect to backend Google OAuth endpoint:
    // window.location.href = "http://localhost:8000/api/v1/auth/google";
  };

  return (
    <div className="auth-page">
      {/* Back to Home Link */}
      <div className="back-to-home">
        <a href="/" className="back-link">
          <span>←</span>
          <span>Back to Home</span>
        </a>
      </div>

      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join BookIt and start your journey</p>

        {/* Google Register Button */}
        <button 
          className="google-btn" 
          onClick={handleGoogleRegister} 
          type="button"
          disabled={loading}
        >
          <span className="google-icon">🔵</span> 
          Sign up with Google
        </button>

        <div className="divider">or</div>

        {/* Email/Password Form */}
        <form className="auth-form" onSubmit={handleEmailRegister}>
          {/* Role Selection */}
          <div className="form-group">
            <label>I want to</label>
            <div className="role-selection">
              {roles.map((role) => (
                <div
                  key={role.value}
                  className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect(role.value)}
                >
                  <div className="role-icon">{role.icon}</div>
                  <div className="role-name">{role.name}</div>
                  <div className="role-desc">{role.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button 
            className="submit-btn" 
            type="submit"
            disabled={loading}
          >
            {loading && <span className="spinner"></span>}
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Error/Success Messages */}
        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            ✓ {success}
          </div>
        )}

        {/* Footer */}
        <div className="auth-footer">
          <span>Already have an account?</span>
          <a href="/login">Login here</a>
        </div>
      </div>
    </div>
  );
}