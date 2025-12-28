// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { authAPI } from "../utils/api.js";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 * 
 * Usage:
 * <Route path="/dashboard" element={
 <ProtectedRoute>
   <Dashboard />
 </ProtectedRoute>
 * } />
 */
export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const isAuthenticated = authAPI.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}



