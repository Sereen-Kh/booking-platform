import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Search,
  Loader2,
  Clock,
  Star,
  Filter,
  Grid3X3,
  List,
  Plus,
  Edit2,
  Trash2,
  Briefcase,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  duration_minutes?: number;
  category_id: number;
  image_url?: string;
  provider_id: number;
  provider?: {
    full_name: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

export default function Services() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const isProvider = user?.role === "provider" || user?.role === "PROVIDER";

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [user]);

  useEffect(() => {
    let result = [...services];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          service.provider?.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(
        (service) => service.category_id === parseInt(selectedCategory)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "duration":
        result.sort((a, b) => a.duration - b.duration);
        break;
      case "name":
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredServices(result);
  }, [searchQuery, selectedCategory, sortBy, services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // If user is a provider, fetch only their services
      const endpoint = isProvider
        ? "/services/provider/my-services"
        : "/services";
      const response = await api.get(endpoint);
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
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const { addToCart, isInCart, getItemCount } = useCart();

  const handleAddToCart = (service: Service) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add services to cart",
      });
      navigate("/auth");
      return;
    }

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
      duration_minutes: service.duration || service.duration_minutes || 60,
      image_url: service.image_url,
      provider: service.provider
        ? {
          id: service.provider_id,
          full_name: service.provider.full_name,
          email: service.provider.email,
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              {isProvider ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Briefcase className="w-8 h-8 text-primary" />
                    <Badge variant="secondary" className="text-sm">
                      Provider View
                    </Badge>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    My Services
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Manage your services, edit details, and track performance
                  </p>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => navigate("/provider/dashboard")}
                    className="mb-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Service
                  </Button>
                </>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    Browse All Services
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Discover and book professional services from our verified
                    providers
                  </p>
                </>
              )}

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={
                    isProvider
                      ? "Search your services..."
                      : "Search services, providers, or categories..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full border-2 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8 p-4 bg-card rounded-xl border">
              <div className="flex flex-wrap gap-3 items-center">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {filteredServices.length} services found
                </span>
                <div className="flex gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Services Content */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  {isProvider ? (
                    <Briefcase className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Search className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isProvider ? "No services yet" : "No services found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isProvider
                    ? "Create your first service to start receiving bookings"
                    : searchQuery
                      ? `No services match "${searchQuery}"`
                      : "No services available at the moment"}
                </p>
                {isProvider ? (
                  <Button
                    variant="hero"
                    onClick={() => navigate("/provider/dashboard")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Service
                  </Button>
                ) : searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                ) : null}
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service, index) => (
                  <Card
                    key={service.id}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-up overflow-hidden"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {service.image_url && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {service.category && (
                          <Badge
                            className="absolute top-3 left-3"
                            variant="secondary"
                          >
                            {service.category.name}
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-1">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {service.provider && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <Star className="w-3 h-3 text-primary" />
                            </div>
                            <span className="truncate">
                              {service.provider.full_name}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xl font-bold text-primary">
                            ${service.price.toFixed(2)}
                          </span>
                          {isProvider ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate("/provider/dashboard")}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant={
                                isInCart(service.id) ? "outline" : "hero"
                              }
                              onClick={() =>
                                isInCart(service.id)
                                  ? handleGoToCart()
                                  : handleAddToCart(service)
                              }
                            >
                              {isInCart(service.id) ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" /> In Cart
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-1" /> Book Now
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredServices.map((service, index) => (
                  <Card
                    key={service.id}
                    className="group hover:shadow-md transition-all duration-300 animate-fade-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {service.image_url && (
                        <div className="md:w-48 h-48 md:h-auto overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold">
                                {service.name}
                              </h3>
                              {service.category && (
                                <Badge variant="secondary">
                                  {service.category.name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {service.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              {service.provider && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-primary" />
                                  {service.provider.full_name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col items-center md:items-end gap-4">
                            <span className="text-2xl font-bold text-primary">
                              ${service.price.toFixed(2)}
                            </span>
                            {isProvider ? (
                              <Button
                                variant="outline"
                                onClick={() => navigate("/provider/dashboard")}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Manage
                              </Button>
                            ) : (
                              <Button
                                variant={
                                  isInCart(service.id) ? "outline" : "hero"
                                }
                                onClick={() =>
                                  isInCart(service.id)
                                    ? handleGoToCart()
                                    : handleAddToCart(service)
                                }
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
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
