import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User as UserIcon,
  Mail,
  ArrowLeft,
  LogOut,
  Loader2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  X,
  Phone,
  MapPin,
  FileText,
  Camera,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { bookingsAPI } from "@/utils/api";
import api from "@/lib/api";

interface Booking {
  id: number;
  service_id: number;
  customer_id: number;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  service?: {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url?: string;
  };
}

interface ProfileFormData {
  full_name: string;
  phone: string;
  address: string;
  bio: string;
  avatar_url: string;
}

interface ProviderProfileData {
  business_name: string;
  bio: string;
  location: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showProviderSetup, setShowProviderSetup] = useState(false);

  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: "",
    phone: "",
    address: "",
    bio: "",
    avatar_url: "",
  });

  const [providerData, setProviderData] = useState<ProviderProfileData>({
    business_name: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
        avatar_url: user.avatar_url || "",
      });

      // Check if provider needs to complete profile
      if (user.role === "PROVIDER" && !user.is_profile_complete) {
        setShowProviderSetup(true);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const data = await bookingsAPI.getUserBookings();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load your bookings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user, toast]);

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      await api.put("/auth/me", profileData);
      await refreshUser();
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleProviderProfileSetup = async () => {
    if (
      !providerData.business_name ||
      !providerData.bio ||
      !providerData.location
    ) {
      toast({
        title: "Incomplete information",
        description:
          "Please fill in all required fields to complete your provider profile.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/providers/profile", providerData);
      await refreshUser();
      setShowProviderSetup(false);
      toast({
        title: "Provider profile created",
        description:
          "Your provider profile is now complete! You can start listing services.",
      });
    } catch (error: any) {
      console.error("Error creating provider profile:", error);
      toast({
        title: "Setup failed",
        description:
          error.message ||
          "Failed to create provider profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      CONFIRMED: "bg-green-500/10 text-green-500 border-green-500/20",
      CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
      COMPLETED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };

    const statusIcons: Record<string, any> = {
      PENDING: Clock,
      CONFIRMED: CheckCircle,
      CANCELLED: XCircle,
      COMPLETED: CheckCircle,
    };

    const Icon = statusIcons[status] || Clock;
    const colorClass = statusColors[status] || statusColors.PENDING;

    return (
      <Badge variant="outline" className={colorClass}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Content */}
      <main className="container mx-auto px-4 py-24 max-w-6xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>

        {/* Provider Setup Alert */}
        {showProviderSetup &&
          user?.role === "PROVIDER" &&
          !user?.is_profile_complete && (
            <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-500">
                <strong>Action Required:</strong> Please complete your provider
                profile below to start listing services on the platform.
              </AlertDescription>
            </Alert>
          )}

        {/* Provider Profile Setup Card */}
        {showProviderSetup &&
          user?.role === "PROVIDER" &&
          !user?.is_profile_complete && (
            <Card className="mb-8 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Complete Your Provider Profile
                </CardTitle>
                <CardDescription>
                  Set up your business profile to start offering services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={providerData.business_name}
                    onChange={(e) =>
                      setProviderData({
                        ...providerData,
                        business_name: e.target.value,
                      })
                    }
                    placeholder="Your business or professional name"
                  />
                </div>
                <div>
                  <Label htmlFor="provider_bio">Bio *</Label>
                  <Textarea
                    id="provider_bio"
                    value={providerData.bio}
                    onChange={(e) =>
                      setProviderData({ ...providerData, bio: e.target.value })
                    }
                    placeholder="Describe your services and expertise (minimum 10 characters)"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Service Location *</Label>
                  <Input
                    id="location"
                    value={providerData.location}
                    onChange={(e) =>
                      setProviderData({
                        ...providerData,
                        location: e.target.value,
                      })
                    }
                    placeholder="City, State or Region"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleProviderProfileSetup}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProviderSetup(false)}
                    disabled={isSaving}
                  >
                    Skip for now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={user?.avatar_url || profileData.avatar_url}
                  />
                  <AvatarFallback className="text-xl gradient-hero text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {user?.full_name || "User"}
                    {user?.is_profile_complete && user?.role === "PROVIDER" && (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </CardDescription>
                  {user?.role && (
                    <Badge variant="outline" className="mt-2 capitalize">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleProfileUpdate} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (user) {
                          setProfileData({
                            full_name: user.full_name || "",
                            phone: user.phone || "",
                            address: user.address || "",
                            bio: user.bio || "",
                            avatar_url: user.avatar_url || "",
                          });
                        }
                      }}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                <Button variant="destructive" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Profile Details */}
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        full_name: e.target.value,
                      })
                    }
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                    placeholder="Your address"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={profileData.avatar_url}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        avatar_url: e.target.value,
                      })
                    }
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-sm">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Address
                      </p>
                      <p className="text-sm">{user.address}</p>
                    </div>
                  </div>
                )}
                {user?.bio && (
                  <div className="md:col-span-2 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Bio
                      </p>
                      <p className="text-sm">{user.bio}</p>
                    </div>
                  </div>
                )}
                {!user?.phone && !user?.address && !user?.bio && (
                  <div className="md:col-span-2 text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No additional profile information. Click "Edit Profile" to
                      add details.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              My Bookings
            </CardTitle>
            <CardDescription>
              View and manage your service bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">No bookings yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Book a service to see it here
                </p>
                <Button onClick={() => navigate("/#services")}>
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Service Image */}
                        {booking.service?.image_url && (
                          <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={booking.service.image_url}
                              alt={booking.service.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Booking Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {booking.service?.name || "Service"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.service?.description}
                              </p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <Separator />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{formatDate(booking.start_time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {formatTime(booking.start_time)} -{" "}
                                {formatTime(booking.end_time)}
                              </span>
                            </div>
                            {booking.service?.price && (
                              <div className="flex items-center gap-2 font-semibold">
                                <span className="text-muted-foreground">
                                  Price:
                                </span>
                                <span className="text-primary">
                                  ${booking.service.price.toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Booking ID: #{booking.id}</span>
                            </div>
                          </div>

                          {booking.notes && (
                            <>
                              <Separator />
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm">
                                  <span className="font-medium">Notes: </span>
                                  {booking.notes}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
