import {
  Star,
  Clock,
  MapPin,
  ShoppingCart,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
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
  provider?: {
    full_name: string;
    email: string;
  };
}

export function FeaturedServices() {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const isProvider = user?.role === "provider" || user?.role === "PROVIDER";

  useEffect(() => {
    fetchServices();
  }, [user]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      let response;

      if (isProvider) {
        // For providers, get their own services
        response = await api.get("/services/provider/my-services");
      } else {
        // For customers/guests, get recommended services
        response = await api.get("/services/recommended?limit=6");
      }

      setServices(response.data || []);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (service: Service) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book services",
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
      duration_minutes: service.duration_minutes,
      image_url:
        service.image_url ||
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      provider: {
        id: service.provider_id,
        full_name: service.provider?.full_name || "Unknown Provider",
        email: service.provider?.email || "",
      },
    });

    toast({
      title: "Added to cart!",
      description: `${service.name} has been added to your cart`,
    });
  };

  const handleGoToCart = () => {
    navigate("/cart");
  };

  if (loading) {
    return (
      <section id="services" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <section id="services" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {isProvider ? "Your Services" : "Featured"}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              {isProvider ? "No Services Yet" : "No Services Available"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isProvider
                ? "You haven't created any services yet. Visit your dashboard to add services."
                : "No services available at the moment."}
            </p>
            {isProvider && (
              <Button
                onClick={() => navigate("/provider/dashboard")}
                className="mt-6"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {isProvider ? "Your Services" : "Featured"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            {isProvider
              ? `Your Services (${services.length})`
              : "Popular Services Near You"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isProvider
              ? `Manage your ${services.length} service${
                  services.length !== 1 ? "s" : ""
                }`
              : "Discover top-rated professionals ready to help with your needs"}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 animate-fade-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/services/${service.id}`)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    service.image_url ||
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"
                  }
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {service.provider?.full_name || "Unknown Provider"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">
                      ${service.price}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  {service.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{service.location}</span>
                    </div>
                  )}
                </div>

                {!isProvider && (
                  <Button
                    variant={isInCart(service.id) ? "outline" : "default"}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      isInCart(service.id)
                        ? handleGoToCart()
                        : handleAddToCart(service);
                    }}
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
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button
            variant="outline-hero"
            size="lg"
            onClick={() => navigate("/services")}
          >
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
}
