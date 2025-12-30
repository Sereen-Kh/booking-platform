import { Search, Calendar, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Service",
    description: "Browse through hundreds of services or search for exactly what you need.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Calendar,
    title: "Pick a Time",
    description: "Choose a convenient date and time slot that works best for your schedule.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: CheckCircle,
    title: "Get It Done",
    description: "Meet your professional, enjoy the service, and pay securely online.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Simple Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Booking services has never been easier. Just three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-border via-primary/30 to-border" />
              )}

              {/* Icon */}
              <div className={`w-24 h-24 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 relative z-10`}>
                <step.icon className="w-10 h-10" />
              </div>

              {/* Step Number */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-8 h-8 rounded-full bg-foreground text-background text-sm font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
