import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User doesn't have the required role
    // Redirect to appropriate page based on their role
    const redirect = getRoleBasedRedirect(user.role);
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}

function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "provider":
      return "/provider/dashboard";
    case "customer":
    default:
      return "/";
  }
}
