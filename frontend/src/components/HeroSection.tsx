import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Clock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
            <Star className="w-4 h-4 fill-primary" />
            <span>Trusted by 50,000+ businesses</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Book Services
            <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Without the Hassle
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Discover and book local services instantly. From home repairs to wellness treatments,
            find trusted professionals in your area.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl">
              Book a Service
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline-hero" size="xl">
              List Your Business
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Users className="w-4 h-4" />
                <span className="text-2xl font-bold">50K+</span>
              </div>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Star className="w-4 h-4 fill-primary" />
                <span className="text-2xl font-bold">4.9</span>
              </div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-2xl font-bold">24/7</span>
              </div>
              <p className="text-xs text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
