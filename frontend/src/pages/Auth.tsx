import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Loader2,
  Briefcase,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type UserRole = "customer" | "provider";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

export default function Auth() {
  const searchParams = new URLSearchParams(window.location.search);
  const modeParam = searchParams.get("mode");
  const roleParam = searchParams.get("role");

  const [isSignUp, setIsSignUp] = useState(modeParam === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    (roleParam as UserRole) || "customer"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
  }>({});

  const { login, logout, register, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already logged in, redirect based on role
    if (!loading && user) {
      const from =
        location.state?.from?.pathname || getRoleBasedRedirect(user.role);
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const getRoleBasedRedirect = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "provider":
        return "/provider/dashboard";
      case "customer":
      case "user":
        return "/customer/dashboard";
      default:
        return "/";
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string } =
      {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.issues[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.issues[0].message;
    }

    if (isSignUp) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.issues[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        await register(fullName, email, password, selectedRole);
        toast({
          title: "Welcome to BookFlow!",
          description: `Your ${selectedRole} account has been created successfully.`,
        });
        // No need to navigate - useEffect will handle redirect based on role
      } else {
        const userData = await login(email, password);
        toast({
          title: "Welcome back!",
          description: `Signed in as ${userData.role}.`,
        });
        // No need to navigate - useEffect will handle redirect based on role
      }
    } catch (error: any) {
      console.error("Authentication error:", error);

      let errorTitle = isSignUp ? "Registration Failed" : "Login Failed";
      let errorMessage = "An unexpected error occurred";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString().includes("NetworkError")) {
        errorTitle = "Network Error";
        errorMessage =
          "Unable to connect to the server. Please check your internet connection and ensure the backend server is running.";
      } else if (error?.toString().includes("fetch")) {
        errorTitle = "Server Connection Failed";
        errorMessage =
          "Cannot connect to the backend server at http://localhost:8000. Please ensure it is running.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Back to Home */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </a>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center shadow-glow">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-foreground">BookFlow</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? "Start booking services in minutes"
              : "Sign in to manage your bookings"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>I want to</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("customer")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        selectedRole === "customer"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Users
                        className={`w-6 h-6 ${
                          selectedRole === "customer"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`font-medium text-sm ${
                          selectedRole === "customer"
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        Book Services
                      </span>
                      <span className="text-xs text-muted-foreground">
                        As a customer
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("provider")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        selectedRole === "provider"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Briefcase
                        className={`w-6 h-6 ${
                          selectedRole === "provider"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`font-medium text-sm ${
                          selectedRole === "provider"
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        Offer Services
                      </span>
                      <span className="text-xs text-muted-foreground">
                        As a provider
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setSelectedRole("customer");
              }}
              className="font-medium text-primary hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 animate-float">
            <Calendar className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Book any service, anytime
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of customers who trust BookFlow for their service
            booking needs. Quick, easy, and reliable.
          </p>
        </div>
      </div>
    </div>
  );
}
