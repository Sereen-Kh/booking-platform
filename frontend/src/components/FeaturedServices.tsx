import { Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <section id="services" className="py-24 bg-secondary/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -left-20 top-40 w-72 h-72 bg-primary/5 rounded-full blur-3xl mix-blend-multiply" />
      <div className="absolute -right-20 bottom-40 w-72 h-72 bg-accent/5 rounded-full blur-3xl mix-blend-multiply" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            <Star className="w-3 h-3 fill-primary" />
            Curated Services
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Popular Services Near You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover top-rated professionals ready to help with your needs.
            Quality service, guaranteed satisfaction.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="group bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-foreground shadow-sm">
                    {service.category}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end">
                  <span className="text-white font-bold text-2xl drop-shadow-md">${service.price}</span>
                  <span className="text-white/90 text-xs font-medium">starting at</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors mb-1">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{service.provider}</p>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-border/50 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span className="font-bold text-foreground">{service.rating}</span>
                    <span className="text-muted-foreground text-sm">({service.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="truncate">{service.location}</span>
                </div>

                <Button variant="default" className="w-full h-11 rounded-xl text-md font-semibold shadow-md group-hover:shadow-glow transition-all duration-300">
                  Book Now
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Button variant="outline" size="lg" className="rounded-full px-8 border-2 hover:bg-background hover:scale-105 transition-all duration-300">
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
}
