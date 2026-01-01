import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Clock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-20 md:pt-24 pb-16 md:pb-20 overflow-hidden bg-[#FBFDFA]">
      {/* Background decoration - more subtle and balanced */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#E8F5F1] rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[35%] h-[35%] bg-[#F3EFEF] rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2 opacity-50" />

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 flex flex-col items-center">
        {/* Badge - reduced spacing */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EBF5F3] border border-[#D1ECEA] text-primary text-sm font-medium mb-8 animate-fade-up">
          <Star className="w-4 h-4 fill-primary" />
          <span>Trusted by 50,000+ businesses</span>
        </div>

        {/* Headline - improved hierarchy and reduced margins */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#1A1A1A] mb-4 md:mb-6 leading-tight tracking-tighter animate-fade-up max-w-2xl md:max-w-3xl mx-auto text-center"
          data-delay="0.1s"
        >
          Experience <br className="hidden md:block" />
          <span className="text-[#5BB5A2]">Service</span>{" "}
          <br className="hidden md:block" />
          <span className="text-[#1A1A1A]">Excellence</span>
        </h1>

        {/* Subheadline - tighter spacing */}
        <p
          className="text-lg md:text-2xl text-gray-500 max-w-lg mx-auto mb-8 md:mb-10 leading-relaxed animate-fade-up text-center"
          data-delay="0.2s"
        >
          Discover and book premium local professionals instantly. Elevate your
          lifestyle with trusted experts at your fingertips.
        </p>

        {/* CTA Buttons - reduced vertical spacing */}
        <div
          className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-10 md:mb-12 animate-fade-up"
          data-delay="0.3s"
        >
          <Button
            variant="hero"
            size="xl"
            className="h-14 min-w-[180px] px-8 md:px-10 rounded-full text-lg shadow-lg border-2 border-primary focus:ring-4 focus:ring-primary/30"
          >
            Book a Service
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="h-14 min-w-[180px] px-8 md:px-10 rounded-full text-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:ring-4 focus:ring-primary/10"
          >
            List Your Business
          </Button>
        </div>

        {/* Stats Bar - more compact and balanced */}
        <div
          className="w-full max-w-3xl mx-auto p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] animate-fade-up"
          data-delay="0.4s"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="space-y-1 flex flex-col items-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  50K+
                </span>
              </div>
              <p className="text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-widest">
                Active Users
              </p>
            </div>
            <div className="space-y-1 flex flex-col items-center relative sm:before:absolute sm:before:left-0 sm:before:top-1/2 sm:before:-translate-y-1/2 sm:before:h-8 sm:before:w-px sm:before:bg-gray-100 sm:after:absolute sm:after:right-0 sm:after:top-1/2 sm:after:-translate-y-1/2 sm:after:h-8 sm:after:w-px sm:after:bg-gray-100">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  4.9
                </span>
              </div>
              <p className="text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-widest">
                Avg Rating
              </p>
            </div>
            <div className="space-y-1 flex flex-col items-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  24/7
                </span>
              </div>
              <p className="text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-widest">
                Support
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
