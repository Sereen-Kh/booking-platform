import { Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: 1,
    title: "Massage Therapy",
    provider: "Zen Wellness",
    rating: 4.9,
    reviews: 276,
    price: 90,
    duration: "1 hr",
    location: "Wellness Center",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop",
    category: "Wellness",
  },
  {
    id: 2,
    title: "Pet Grooming",
    provider: "Pawfect Care",
    rating: 4.8,
    reviews: 167,
    price: 45,
    duration: "1 hr",
    location: "Pet Plaza",
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&h=600&fit=crop",
    category: "Pet Care",
  },
  {
    id: 3,
    title: "Home Cleaning",
    provider: "Sparkle Clean Co.",
    rating: 4.9,
    reviews: 328,
    price: 80,
    duration: "2-3 hrs",
    location: "Your Location",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
    category: "Home Services",
  },
  {
    id: 4,
    title: "Personal Training",
    provider: "FitLife Studio",
    rating: 4.8,
    reviews: 215,
    price: 65,
    duration: "1 hr",
    location: "Downtown Gym",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
    category: "Fitness",
  },
];

export function FeaturedServices() {
  return (
    <section
      id="services"
      className="py-16 md:py-20 bg-[#FDFBF7] relative overflow-hidden"
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-primary text-xs font-semibold tracking-wide uppercase mb-4 shadow-sm">
            <Star className="w-3 h-3 fill-primary" />
            Curated Services
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Popular Services Near You
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Discover top-rated professionals ready to help with your needs.
          </p>
        </div>

        {/* Services Grid - 2 Columns Desktop, 1 Column Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              data-testid={`service-card-${service.id}`}
              className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Image Container - Fixed aspect ratio for consistent proportions */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Price Badge - Top Right */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
                  <span className="text-sm font-bold text-gray-900">${service.price}</span>
                </div>

                {/* Category Badge - Top Left */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
                  <span className="text-xs font-medium text-gray-600">{service.category}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* Title & Provider */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    by {service.provider}
                  </p>
                </div>

                {/* Meta Row - Rating & Duration */}
                <div className="flex items-center gap-3 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-gray-900">{service.rating}</span>
                    <span className="text-gray-400">({service.reviews})</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.duration}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{service.location}</span>
                </div>

                {/* CTA Button - Anchored at bottom */}
                <Button 
                  data-testid={`book-service-${service.id}`}
                  className="w-full h-10 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 md:mt-12">
          <Button
            variant="outline"
            data-testid="view-all-services"
            className="h-10 px-6 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium"
          >
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
}
