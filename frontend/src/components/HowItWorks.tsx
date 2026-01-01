import { Search, Calendar, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Service",
    description:
      "Browse through hundreds of services or search for exactly what you need.",
    bgColor: "bg-[#E8F5F3]",
    iconColor: "text-[#2A9D8F]",
    badgeBg: "bg-[#1A3A35]",
  },
  {
    icon: Calendar,
    title: "Pick a Time",
    description:
      "Choose a convenient date and time slot that works best for your schedule.",
    bgColor: "bg-[#FEE9E5]",
    iconColor: "text-[#E76F51]",
    badgeBg: "bg-[#1A1A1A]",
  },
  {
    icon: CheckCircle,
    title: "Get It Done",
    description:
      "Meet your professional, enjoy the service, and pay securely online.",
    bgColor: "bg-[#E8F5EC]",
    iconColor: "text-[#2A9D8F]",
    badgeBg: "bg-[#1A3A35]",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-20 md:py-28 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-20">
          <span className="text-primary font-semibold text-xs uppercase tracking-[0.25em] mb-4 block">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#1A1A1A] mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-base md:text-lg">
            Booking services has never been easier. Just three simple steps.
          </p>
        </div>

        {/* Steps - 3 columns evenly spaced */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              {/* Icon Container with Badge */}
              <div className="relative inline-flex mb-8">
                {/* Step Number Badge - positioned at top-right */}
                <div
                  className={`absolute -top-2 -right-2 w-7 h-7 rounded-full ${step.badgeBg} text-white text-sm font-bold flex items-center justify-center z-10`}
                >
                  {index + 1}
                </div>

                {/* Icon Background */}
                <div
                  className={`w-28 h-28 md:w-32 md:h-32 rounded-3xl ${step.bgColor} flex items-center justify-center`}
                >
                  <step.icon
                    className={`w-12 h-12 md:w-14 md:h-14 ${step.iconColor} stroke-[1.5]`}
                  />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-[22px] font-bold text-[#1A1A1A] mb-3">
                {step.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-[15px] max-w-[260px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
