import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Search,
  Loader2,
  Clock,
  Star,
  ArrowLeft,
  Grid3X3,
  Briefcase,
  Home,
  Scissors,
  Heart,
  Car,
  Dumbbell,
  Camera,
  PawPrint,
  Sparkles,
  Edit2,
  Plus,
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
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

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
}

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

// Map category names to icons
const getCategoryIcon = (name: string) => {
  const iconMap: Record<string, any> = {
    "Home Services": Home,
    "Beauty & Spa": Scissors,
    Wellness: Heart,
    Automotive: Car,
    Fitness: Dumbbell,
    Photography: Camera,
    "Pet Care": PawPrint,
    Professional: Briefcase,
  };
  return iconMap[name] || Sparkles;
};

// Map category names to colors
const getCategoryColor = (name: string) => {
  const colorMap: Record<string, string> = {
    "Home Services":
      "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20",
    "Beauty & Spa":
      "bg-pink-500/10 text-pink-600 border-pink-500/30 hover:bg-pink-500/20",
    Wellness:
      "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20",
    Automotive:
      "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20",
    Fitness:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20",
    Photography:
      "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20",
    "Pet Care":
      "bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20",
    Professional:
      "bg-cyan-500/10 text-cyan-600 border-cyan-500/30 hover:bg-cyan-500/20",
  };
  return (
    colorMap[name] ||
    "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
  );
};

export default function Categories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerServices, setProviderServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isProvider = user?.role === "provider" || user?.role === "PROVIDER";
  const categoryIdParam = searchParams.get("category");

  useEffect(() => {
    fetchCategories();
    if (isProvider) {
      fetchProviderServices();
    }
  }, [user]);

  useEffect(() => {
    // If category ID is in URL, select it
    if (categoryIdParam && categories.length > 0) {
      const category = categories.find(
        (c) => c.id === parseInt(categoryIdParam)
      );
      if (category) {
        handleCategoryClick(category);
      }
    }
  }, [categoryIdParam, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      setCategories(response.data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      // Fallback to default categories if API fails
      setCategories([
        { id: 1, name: "Home Services" },
        { id: 2, name: "Beauty & Spa" },
        { id: 3, name: "Wellness" },
        { id: 4, name: "Automotive" },
        { id: 5, name: "Fitness" },
        { id: 6, name: "Photography" },
        { id: 7, name: "Pet Care" },
        { id: 8, name: "Professional" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderServices = async () => {
    try {
      const response = await api.get("/services/provider/my-services");
      setProviderServices(response.data || []);
    } catch (error: any) {
      console.error("Error fetching provider services:", error);
      setProviderServices([]);
    }
  };

  const fetchServicesByCategory = async (categoryId: number) => {
    try {
      setLoadingServices(true);

      if (isProvider) {
        // For providers, get their own services filtered by category
        const response = await api.get("/services/provider/my-services");
        const allServices = response.data || [];
        const filteredServices = allServices.filter(
          (s: Service) => s.category_id === categoryId
        );
        setServices(filteredServices);
      } else {
        // For customers/guests, use the API filter
        const response = await api.get(`/services?category_id=${categoryId}`);
        setServices(response.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSearchParams({ category: category.id.toString() });
    fetchServicesByCategory(category.id);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setServices([]);
    setSearchParams({});
  };

  const handleBookService = (serviceId: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book a service",
      });
      navigate("/auth");
      return;
    }
    toast({
      title: "Coming soon",
      description: "Booking functionality will be available soon!",
    });
  };

  // Get categories that the provider has services in
  const getProviderCategories = () => {
    const providerCategoryIds = new Set(
      providerServices.map((s) => s.category_id)
    );
    return categories.filter((c) => providerCategoryIds.has(c.id));
  };

  // Count services per category for provider
  const getServiceCountForCategory = (categoryId: number) => {
    if (isProvider) {
      return providerServices.filter((s) => s.category_id === categoryId)
        .length;
    }
    return null; // We don't have counts for general view
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For provider view, also show which categories they have services in
  const providerCategoryIds = new Set(
    providerServices.map((s) => s.category_id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              {selectedCategory ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleBackToCategories}
                    className="mb-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Categories
                  </Button>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {(() => {
                      const IconComponent = getCategoryIcon(
                        selectedCategory.name
                      );
                      return (
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getCategoryColor(
                            selectedCategory.name
                          )}`}
                        >
                          <IconComponent className="w-8 h-8" />
                        </div>
                      );
                    })()}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    {selectedCategory.name}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-4">
                    {isProvider
                      ? `Your services in ${selectedCategory.name}`
                      : `Browse ${selectedCategory.name.toLowerCase()} services`}
                  </p>
                  {isProvider && (
                    <Badge variant="secondary" className="mb-4">
                      <Briefcase className="w-3 h-3 mr-1" />
                      Provider View
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  {isProvider && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Briefcase className="w-8 h-8 text-primary" />
                      <Badge variant="secondary" className="text-sm">
                        Provider View
                      </Badge>
                    </div>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    {isProvider ? "Your Categories" : "Browse Categories"}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    {isProvider
                      ? "View and manage your services by category"
                      : "Explore our wide range of service categories"}
                  </p>

                  {/* Search Bar */}
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-6 text-lg rounded-full border-2 focus:border-primary"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedCategory ? (
              /* Services in Selected Category */
              <div>
                {loadingServices ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                      <Grid3X3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {isProvider
                        ? "No services in this category"
                        : "No services found"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {isProvider
                        ? "You haven't created any services in this category yet"
                        : "No services available in this category at the moment"}
                    </p>
                    {isProvider && (
                      <Button
                        variant="hero"
                        onClick={() => navigate("/provider/dashboard")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create a Service
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service, index) => (
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
                            {!isProvider && service.provider && (
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
                              <span>
                                {service.duration || service.duration_minutes}{" "}
                                min
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-xl font-bold text-primary">
                                ${service.price.toFixed(2)}
                              </span>
                              {isProvider ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    navigate("/provider/dashboard")
                                  }
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="hero"
                                  onClick={() => handleBookService(service.id)}
                                >
                                  Book Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Categories Grid */
              <div>
                {isProvider && (
                  <div className="mb-8 p-4 bg-card rounded-xl border">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="font-semibold">
                          Your Active Categories
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          You have services in {getProviderCategories().length}{" "}
                          of {categories.length} categories
                        </p>
                      </div>
                      <Button
                        variant="hero"
                        onClick={() => navigate("/provider/dashboard")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                  </div>
                )}

                {filteredCategories.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No categories found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No categories match "{searchQuery}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredCategories.map((category, index) => {
                      const IconComponent = getCategoryIcon(category.name);
                      const colorClass = getCategoryColor(category.name);
                      const serviceCount = getServiceCountForCategory(
                        category.id
                      );
                      const hasProviderServices = providerCategoryIds.has(
                        category.id
                      );

                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category)}
                          className={`group p-8 bg-card rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-up text-left relative overflow-hidden ${
                            isProvider && hasProviderServices
                              ? "ring-2 ring-primary/50"
                              : ""
                          }`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          {isProvider && hasProviderServices && (
                            <Badge
                              className="absolute top-3 right-3 text-xs"
                              variant="default"
                            >
                              {serviceCount}{" "}
                              {serviceCount === 1 ? "service" : "services"}
                            </Badge>
                          )}
                          <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}
                          >
                            <IconComponent className="w-7 h-7" />
                          </div>
                          <h3 className="font-semibold text-lg text-foreground mb-2">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {isProvider
                              ? hasProviderServices
                                ? "Click to view your services"
                                : "No services yet"
                              : "Browse services →"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
