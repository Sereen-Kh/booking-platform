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
      className="py-24 md:py-32 bg-[#FDFBF7] relative overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-primary text-xs font-bold tracking-wider uppercase mb-6 shadow-sm">
            <Star className="w-3 h-3 fill-primary" />
            Curated Services
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A1A1A] mb-4 tracking-tight">
            Popular Services Near You
          </h2>
          <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Discover top-rated professionals ready to help with your needs.
            Quality service, guaranteed satisfaction.
          </p>
        </div>

        {/* Services Grid - 2 Columns for Large Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {services.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Image Header */}
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />

                {/* Price Display - Top Right Overlay */}
                <div className="absolute top-4 right-4 text-right z-20">
                  <div className="text-2xl font-bold text-white drop-shadow-md tracking-tight">
                    ${service.price}
                  </div>
                  <div className="text-white/90 text-xs font-medium drop-shadow-md">
                    starting at
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="flex flex-col flex-grow p-6">
                {/* Title and Provider */}
                <div className="mb-4">
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-1 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {service.provider}
                  </p>
                </div>

                {/* Meta Information Row */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span className="font-bold text-gray-900 text-sm">
                      {service.rating}
                    </span>
                    <span className="text-gray-400 text-sm">
                      ({service.reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{service.duration}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-500 mb-6">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {service.location}
                  </span>
                </div>

                {/* Primary CTA */}
                <div className="mt-auto">
                  <Button className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/10 transition-all duration-300">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary CTA */}
        <div className="text-center mt-16 md:mt-24">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-12 rounded-full border-2 border-gray-200 bg-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all font-semibold text-base tracking-wide"
          >
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
}
