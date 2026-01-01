import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-[#FBFDFA]">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="relative rounded-2xl md:rounded-3xl bg-[#5BB5A2] p-8 md:p-16 text-center overflow-hidden shadow-2xl flex flex-col items-center">
          {/* Background decorations - more subtle */}
          <div className="absolute top-0 right-0 w-[40%] h-full bg-white/5 skew-x-[-20deg] translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 md:w-28 h-20 md:h-28 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 leading-tight tracking-tight max-w-2xl mx-auto">
            Ready to Get Started?
          </h2>
          <p className="text-white/90 text-base md:text-xl max-w-xl mx-auto mb-6 md:mb-10 font-medium">
            Join thousands of satisfied customers who book services effortlessly
            every day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Button
              variant="outline"
              size="xl"
              className="h-12 md:h-14 px-6 md:px-10 rounded-full text-base bg-white border-transparent text-[#5BB5A2] hover:bg-gray-50 transition-all font-bold group"
            >
              Start Booking Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="ghost"
              size="xl"
              className="h-12 md:h-14 px-6 md:px-10 rounded-full text-base text-white hover:bg-white/10 font-bold"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
