import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Search,
  ShoppingCart,
  Check,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";

interface Booking {
  id: number;
  service_id: number;
  provider_id: number;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
  service?: {
    name: string;
    description: string;
    price: number;
    image_url?: string;
  };
  provider?: {
    full_name: string;
    email: string;
  };
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category_id: number;
  image_url?: string;
  provider_id: number;
  provider?: {
    full_name: string;
  };
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredServices(
        services.filter(
          (service) =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredServices(services);
    }
  }, [searchQuery, services]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await api.get("/bookings/me");
      setBookings(response.data);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive",
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await api.patch(`/bookings/${bookingId}/status?status=cancelled`);
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      fetchBookings();
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to cancel booking.",
        variant: "destructive",
      });
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await api.get("/services");
      setServices(response.data);
      setFilteredServices(response.data);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoadingServices(false);
    }
  };

  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (service: Service) => {
    if (isInCart(service.id)) {
      toast({
        title: "Already in cart",
        description: `${service.name} is already in your cart`,
      });
      return;
    }

    addToCart({
      serviceId: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration || 60,
      image_url: service.image_url,
      provider: service.provider
        ? {
          id: service.provider_id,
          full_name: service.provider.full_name,
          email: "", // Default to empty if not available in this view
        }
        : undefined,
    });

    toast({
      title: "Added to cart!",
      description: `${service.name} has been added to your cart`,
    });
  };

  const handleGoToCart = () => {
    navigate("/cart");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: any;
      }
    > = {
      pending: { variant: "secondary", icon: Clock },
      confirmed: { variant: "default", icon: CheckCircle },
      completed: { variant: "outline", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
    };

    const config = statusConfig[status.toLowerCase()] || {
      variant: "secondary" as const,
      icon: AlertCircle,
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    completedBookings: bookings.filter((b) => b.status === "completed").length,
    cancelledBookings: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.full_name || user?.email}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your bookings and explore available services
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingBookings}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completedBookings}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully finished
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <XCircle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.cancelledBookings}
                </div>
                <p className="text-xs text-muted-foreground">Not completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="services">Browse Services</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    Your latest service bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No bookings yet</p>
                      <Button
                        className="mt-4"
                        onClick={() => setActiveTab("services")}
                      >
                        Browse Services
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {booking.service?.name || "Service"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Provider: {booking.provider?.full_name || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(booking.start_time)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                ${booking.service?.price?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>
                    View and manage all your service bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No bookings yet</p>
                      <Button
                        className="mt-4"
                        onClick={() => setActiveTab("services")}
                      >
                        Browse Services
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">
                              {booking.service?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              {booking.provider?.full_name ||
                                booking.provider?.email ||
                                "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(booking.start_time)}
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                              ${booking.service?.price?.toFixed(2) || "0.00"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(booking.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Details
                                </Button>
                                {booking.status.toLowerCase() === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Available Services</CardTitle>
                  <CardDescription>
                    Browse and book services from our providers
                  </CardDescription>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingServices ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery
                        ? "No services match your search"
                        : "No services available"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredServices.map((service) => (
                        <Card
                          key={service.id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            {service.image_url && (
                              <img
                                src={service.image_url}
                                alt={service.name}
                                className="w-full h-40 object-cover rounded-lg mb-4"
                              />
                            )}
                            <CardTitle className="text-lg">
                              {service.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {service.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  Provider
                                </span>
                                <span className="text-sm font-medium">
                                  {service.provider?.full_name || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  Duration
                                </span>
                                <span className="text-sm font-medium">
                                  {service.duration} min
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-primary">
                                  ${service.price.toFixed(2)}
                                </span>
                                <Button
                                  size="sm"
                                  variant={isInCart(service.id) ? "outline" : "hero"}
                                  onClick={() => isInCart(service.id) ? handleGoToCart() : handleAddToCart(service)}
                                >
                                  {isInCart(service.id) ? (
                                    <>
                                      <Check className="w-4 h-4 mr-2" /> In Cart
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-4 h-4 mr-2" /> Book Now
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
