import { Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const services = [
  {
    id: 1,
    title: "Home Cleaning",
    provider: "Sparkle Clean Co.",
    rating: 4.9,
    reviews: 328,
    price: 80,
    duration: "2-3 hrs",
    location: "Your Location",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    category: "Home Services",
  },
  {
    id: 2,
    title: "Personal Training",
    provider: "FitLife Studio",
    rating: 4.8,
    reviews: 215,
    price: 65,
    duration: "1 hr",
    location: "Downtown Gym",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
    category: "Fitness",
  },
  {
    id: 3,
    title: "Hair Styling",
    provider: "Luxe Salon",
    rating: 5.0,
    reviews: 412,
    price: 55,
    duration: "45 min",
    location: "Main Street",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
    category: "Beauty",
  },
  {
    id: 4,
    title: "Plumbing Repair",
    provider: "Quick Fix Pros",
    rating: 4.7,
    reviews: 189,
    price: 95,
    duration: "1-2 hrs",
    location: "Your Location",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    category: "Home Services",
  },
  {
    id: 5,
    title: "Massage Therapy",
    provider: "Zen Wellness",
    rating: 4.9,
    reviews: 276,
    price: 90,
    duration: "1 hr",
    location: "Wellness Center",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
    category: "Wellness",
  },
  {
    id: 6,
    title: "Pet Grooming",
    provider: "Pawfect Care",
    rating: 4.8,
    reviews: 167,
    price: 45,
    duration: "1 hr",
    location: "Pet Plaza",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=300&fit=crop",
    category: "Pet Care",
  },
];

export function FeaturedServices() {
  const navigate = useNavigate();

  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Featured</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Popular Services Near You
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover top-rated professionals ready to help with your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
                    {service.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{service.provider}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">${service.price}</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium text-foreground">{service.rating}</span>
                    <span>({service.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{service.location}</span>
                </div>

                <Button variant="default" className="w-full" onClick={() => navigate("/services")}>
                  Book Now
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button variant="outline-hero" size="lg" onClick={() => navigate("/services")}>
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
}
