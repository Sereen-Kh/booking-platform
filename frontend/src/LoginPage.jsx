import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Placeholder: Replace with real Google OAuth logic
  const handleGoogleLogin = async () => {
    // window.location.href = "/api/auth/google"; // Uncomment when backend is ready
    alert("Google login not yet implemented");
  };

  // Placeholder: Replace with real API call
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    // TODO: Replace with real API call
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    // Simulate login success
    navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login to BookIt</h2>
        <button className="google-btn" onClick={handleGoogleLogin} type="button">
          <span className="google-icon">🔵</span> Continue with Google
        </button>
        <div className="divider">or</div>
        <form className="auth-form" onSubmit={handleEmailLogin}>
          <label>Email</label>
          <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="submit-btn" type="submit">Login</button>
        </form>
        {error && <div style={{ color: "#e53e3e", marginTop: 8, textAlign: "center" }}>{error}</div>}
        <div className="auth-footer">
          <span>Don't have an account?</span>
          <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
}
