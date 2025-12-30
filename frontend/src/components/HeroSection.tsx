import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Clock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="absolute inset-0 -z-5 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium mb-8 animate-fade-up backdrop-blur-md shadow-sm">
            <Star className="w-5 h-5 fill-primary" />
            <span className="tracking-wide">Trusted by 50,000+ businesses</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground mb-8 leading-tight tracking-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Experience Service <br className="hidden md:block" />
            <span className="bg-gradient-hero bg-clip-text text-transparent drop-shadow-sm">
              Excellence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up font-light" style={{ animationDelay: "0.2s" }}>
            Discover and book premium local professionals instantly. 
            Elevate your lifestyle with trusted experts at your fingertips.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" className="h-14 px-8 text-lg shadow-glow hover:scale-105 transition-transform duration-300">
              Book a Service
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <Button variant="outline" size="xl" className="h-14 px-8 text-lg border-2 hover:bg-muted/50 transition-all duration-300">
              List Your Business
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-3xl mx-auto animate-fade-up p-8 rounded-3xl bg-card/50 border border-white/20 backdrop-blur-md shadow-lg" style={{ animationDelay: "0.4s" }}>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Users className="w-6 h-6" />
                <span className="text-4xl font-bold tracking-tight">50K+</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Users</p>
            </div>
            <div className="text-center space-y-2 relative sm:before:absolute sm:before:left-0 sm:before:top-1/2 sm:before:-translate-y-1/2 sm:before:h-12 sm:before:w-px sm:before:bg-border/50 sm:after:absolute sm:after:right-0 sm:after:top-1/2 sm:after:-translate-y-1/2 sm:after:h-12 sm:after:w-px sm:after:bg-border/50">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Star className="w-6 h-6 fill-primary" />
                <span className="text-4xl font-bold tracking-tight">4.9</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Rating</p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Clock className="w-6 h-6" />
                <span className="text-4xl font-bold tracking-tight">24/7</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
