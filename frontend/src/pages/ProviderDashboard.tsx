import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Settings,
  Plus,
  Home,
  Loader2,
  Package,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  User,
  TrendingUp,
  MoreVertical,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category_id: number;
  image_url?: string;
  location?: string;
  provider_id: number;
}

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
  };
  customer?: {
    id: number;
    email: string;
    full_name?: string;
  };
}

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export default function ProviderDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    category_id: "",
    location: "",
    image_url: "",
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (user.role !== "provider" && user.role !== "PROVIDER") {
        navigate("/");
      } else if (!user.is_profile_complete) {
        // Redirect to onboarding if profile not complete
        navigate("/provider/onboarding");
      } else {
        fetchData();
      }
    }
  }, [user, loading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchServices(), fetchBookings(), fetchCategories()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get("/services/provider/my-services");
      setServices(response.data || []);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings/managed");
      setBookings(response.data || []);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: number,
    newStatus: string
  ) => {
    try {
      await api.patch(`/bookings/${bookingId}/status?status=${newStatus}`);
      toast({
        title: "Booking Updated",
        description: `Booking has been ${newStatus.toLowerCase()}.`,
      });
      fetchBookings();
    } catch (error: any) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to update booking status.",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/services/categories");
      setCategories(response.data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    setServiceForm({
      name: "",
      description: "",
      price: "",
      duration_minutes: "",
      category_id: "",
      location: "",
      image_url: "",
    });
    setIsServiceDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      category_id: service.category_id.toString(),
      location: service.location || "",
      image_url: service.image_url || "",
    });
    setIsServiceDialogOpen(true);
  };

  const handleSaveService = async () => {
    if (
      !serviceForm.name ||
      !serviceForm.price ||
      !serviceForm.duration_minutes ||
      !serviceForm.category_id
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (Name, Price, Duration, Category).",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const serviceData = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price),
        duration_minutes: parseInt(serviceForm.duration_minutes),
        category_id: parseInt(serviceForm.category_id),
        location: serviceForm.location || null,
        image_url: serviceForm.image_url || null,
      };

      if (editingService) {
        await api.put(
          `/services/provider/my-services/${editingService.id}`,
          serviceData
        );
        toast({
          title: "Service Updated",
          description: "Your service has been updated successfully.",
        });
      } else {
        await api.post("/services/provider/my-services", serviceData);
        toast({
          title: "Service Created",
          description: "Your new service is now live on the platform!",
        });
      }

      setIsServiceDialogOpen(false);
      fetchServices();
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save service.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;

    try {
      await api.delete(`/services/provider/my-services/${deleteServiceId}`);
      toast({
        title: "Service Deleted",
        description: "Your service has been removed from the platform.",
      });
      setDeleteServiceId(null);
      fetchServices();
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive",
      });
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      PENDING: {
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        icon: Clock,
      },
      CONFIRMED: {
        color: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: CheckCircle,
      },
      CANCELLED: {
        color: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: XCircle,
      },
      COMPLETED: {
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Calculate stats
  const totalServices = services.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "CONFIRMED"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.service?.price || 0), 0);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    if (bookingFilter !== "all" && booking.status !== bookingFilter) {
      return false;
    }
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        booking.service?.name.toLowerCase().includes(search) ||
        booking.customer?.full_name?.toLowerCase().includes(search) ||
        booking.customer?.email.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Dashboard Header */}
      <div className="border-b bg-card mt-16">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Provider Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.full_name || user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Profile Completion Alert */}
        {!user?.is_profile_complete && (
          <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-500 flex items-center justify-between">
              <span>
                <strong>Complete Your Profile:</strong> Add your business
                details to appear more professional to customers.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className="ml-4"
              >
                Complete Profile
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Services
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServices}</div>
              <p className="text-xs text-muted-foreground">
                {totalServices === 0
                  ? "Create your first service"
                  : "Listed on platform"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings}</div>
              <p className="text-xs text-muted-foreground">
                {pendingBookings > 0
                  ? "Awaiting confirmation"
                  : "No pending orders"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedBookings}</div>
              <p className="text-xs text-muted-foreground">
                {confirmedBookings > 0
                  ? "Confirmed appointments"
                  : "No upcoming bookings"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {completedBookings} completed orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">
              Services ({totalServices})
            </TabsTrigger>
            <TabsTrigger value="orders">Orders ({bookings.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks to manage your business
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={handleCreateService}
                >
                  <Plus className="w-6 h-6 text-primary" />
                  <span>Add New Service</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab("orders")}
                >
                  <Calendar className="w-6 h-6 text-primary" />
                  <span>View Bookings</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate("/profile")}
                >
                  <Settings className="w-6 h-6 text-primary" />
                  <span>Edit Profile</span>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest booking requests</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("orders")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <p className="text-sm text-muted-foreground">
                      Orders will appear here when customers book your services
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {booking.service?.name || "Service"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.start_time)} at{" "}
                              {formatTime(booking.start_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-primary">
                            ${booking.service?.price?.toFixed(2) || "0.00"}
                          </span>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Getting Started - Show if no services */}
            {services.length === 0 && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Get Started
                  </CardTitle>
                  <CardDescription>
                    Complete these steps to start receiving bookings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        user?.is_profile_complete
                          ? "bg-green-500/10 text-green-500"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {user?.is_profile_complete ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="font-bold">1</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">
                        Complete Your Profile
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add your business name, description, and location
                      </p>
                      {!user?.is_profile_complete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/profile")}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Setup Profile
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">
                        Add Your First Service
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Create service listings with name, duration, and fixed
                        pricing
                      </p>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleCreateService}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Service
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg opacity-60">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">
                        Start Receiving Bookings
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Customers can discover and book your services
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Your Services</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your service listings with standardized pricing
                </p>
              </div>
              <Button onClick={handleCreateService}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            {services.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No services yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md">
                    Create your first service to start receiving bookings. Each
                    service needs a name, duration, and fixed price.
                  </p>
                  <Button onClick={handleCreateService}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    {service.image_url && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {service.name}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {getCategoryName(service.category_id)}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditService(service)}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteServiceId(service.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      {service.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="font-semibold">
                            ${service.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatDuration(service.duration_minutes)}
                          </span>
                        </div>
                      </div>
                      {service.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                          <MapPin className="w-4 h-4" />
                          <span>{service.location}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Service
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Orders & Bookings</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage customer bookings
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={bookingFilter} onValueChange={setBookingFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No orders found
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {bookings.length === 0
                      ? "When customers book your services, their orders will appear here."
                      : "No orders match your current filters."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">
                                  {booking.service?.name || "Service"}
                                </h3>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Order #{booking.id}
                              </p>
                            </div>
                            <span className="text-xl font-bold text-primary">
                              ${booking.service?.price?.toFixed(2) || "0.00"}
                            </span>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">
                                  Customer
                                </p>
                                <p className="font-medium">
                                  {booking.customer?.full_name ||
                                    booking.customer?.email ||
                                    "Customer"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">
                                  {formatDate(booking.start_time)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Time</p>
                                <p className="font-medium">
                                  {formatTime(booking.start_time)} -{" "}
                                  {formatTime(booking.end_time)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">
                                  Booked On
                                </p>
                                <p className="font-medium">
                                  {formatDate(booking.created_at)}
                                </p>
                              </div>
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

                          {/* Action Buttons */}
                          <Separator />
                          <div className="flex flex-wrap gap-2 pt-2">
                            {booking.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateBookingStatus(
                                      booking.id,
                                      "confirmed"
                                    )
                                  }
                                  className="gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleUpdateBookingStatus(
                                      booking.id,
                                      "cancelled"
                                    )
                                  }
                                  className="gap-1"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Decline
                                </Button>
                              </>
                            )}
                            {booking.status === "CONFIRMED" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    handleUpdateBookingStatus(
                                      booking.id,
                                      "completed"
                                    )
                                  }
                                  className="gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateBookingStatus(
                                      booking.id,
                                      "cancelled"
                                    )
                                  }
                                  className="gap-1"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            {(booking.status === "COMPLETED" ||
                              booking.status === "CANCELLED") && (
                              <p className="text-sm text-muted-foreground italic">
                                No actions available for{" "}
                                {booking.status.toLowerCase()} bookings
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Service Create/Edit Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Create New Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update your service details below."
                : "Define your service with standardized pricing. Customers will know exactly what they're getting."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Service Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Home Cleaning, Electrical Repair"
                value={serviceForm.name}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what's included in this service..."
                value={serviceForm.description}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="49.99"
                  value={serviceForm.price}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, price: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration (min) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  placeholder="60"
                  value={serviceForm.duration_minutes}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      duration_minutes: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={serviceForm.category_id}
                onValueChange={(value) =>
                  setServiceForm({ ...serviceForm, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Service Location</Label>
              <Input
                id="location"
                placeholder="e.g., New York, NY or Remote"
                value={serviceForm.location}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                placeholder="https://example.com/service-image.jpg"
                value={serviceForm.image_url}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, image_url: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsServiceDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveService} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingService ? (
                "Update Service"
              ) : (
                "Create Service"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteServiceId}
        onOpenChange={() => setDeleteServiceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? This action cannot
              be undone. Any existing bookings for this service will be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Footer />
    </div>
  );
}
