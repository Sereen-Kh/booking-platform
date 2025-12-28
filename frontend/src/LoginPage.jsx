import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "./utils/api.js";
import "./AuthPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
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
    return true;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      setSuccess("Login successful! Redirecting...");
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Implement Google OAuth when backend is ready
    alert("Google OAuth integration coming soon!\n\nFor now, please use email/password login.");
    
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
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue to BookIt</p>

        {/* Google Login Button */}
        <button 
          className="google-btn" 
          onClick={handleGoogleLogin} 
          type="button"
          disabled={loading}
        >
          <span className="google-icon">🔵</span> 
          Continue with Google
        </button>

        <div className="divider">or</div>

        {/* Email/Password Form */}
        <form className="auth-form" onSubmit={handleEmailLogin}>
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

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
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

          <div className="forgot-password">
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <button 
            className="submit-btn" 
            type="submit"
            disabled={loading}
          >
            {loading && <span className="spinner"></span>}
            {loading ? "Logging in..." : "Login"}
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
          <span>Don't have an account?</span>
          <a href="/register">Create one now</a>
        </div>
      </div>
    </div>
  );
}