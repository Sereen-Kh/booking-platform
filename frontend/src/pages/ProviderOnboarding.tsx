import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Building2,
  MapPin,
  FileText,
  Loader2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function ProviderOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<{
    businessName?: string;
    bio?: string;
    location?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!businessName.trim() || businessName.length < 3) {
      newErrors.businessName = "Business name must be at least 3 characters";
    }

    if (!bio.trim() || bio.length < 20) {
      newErrors.bio = "Bio must be at least 20 characters";
    }

    if (!location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      await api.post("/providers/profile", {
        business_name: businessName,
        bio,
        location,
      });

      // Refresh user data to update is_profile_complete
      await refreshUser();

      toast({
        title: "Profile created!",
        description: "Your provider profile has been set up successfully.",
      });

      navigate("/provider/dashboard");
    } catch (error: any) {
      console.error("Profile creation error:", error);
      toast({
        title: "Profile creation failed",
        description:
          error.response?.data?.detail || "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-sm ml-2 text-muted-foreground">
                Account Created
              </span>
            </div>
            <div className="w-16 h-1 bg-primary" />
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <span className="text-sm ml-2 font-medium">Business Profile</span>
            </div>
            <div className="w-16 h-1 bg-muted" />
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold">
                3
              </div>
              <span className="text-sm ml-2 text-muted-foreground">
                List Services
              </span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  Complete Your Business Profile
                </CardTitle>
                <CardDescription>
                  Tell us about your business to start listing services
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <Alert>
                    <AlertDescription>
                      This information will be visible to customers booking your
                      services
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="businessName">
                      Business Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="businessName"
                        placeholder="e.g., John's Plumbing Services"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.businessName && (
                      <p className="text-sm text-destructive">
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Service Location <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g., New York, NY"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.location && (
                      <p className="text-sm text-destructive">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">
                      Business Description{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Textarea
                        id="bio"
                        placeholder="Describe your business, experience, and services you offer..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="pl-10 min-h-[120px]"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {bio.length}/500 characters (minimum 20)
                    </p>
                    {errors.bio && (
                      <p className="text-sm text-destructive">{errors.bio}</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full"
                    variant="hero"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        Complete Profile
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    You can update this information later from your dashboard
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
