import {
  Home,
  Scissors,
  Heart,
  Car,
  Dumbbell,
  Camera,
  PawPrint,
  Briefcase,
} from "lucide-react";

const categories = [
  {
    icon: Home,
    label: "Home Services",
    count: 1240,
  },
  {
    icon: Scissors,
    label: "Beauty & Spa",
    count: 856,
  },
  {
    icon: Heart,
    label: "Wellness",
    count: 623,
  },
  {
    icon: Car,
    label: "Automotive",
    count: 412,
  },
  {
    icon: Dumbbell,
    label: "Fitness",
    count: 534,
  },
  {
    icon: Camera,
    label: "Photography",
    count: 298,
  },
  {
    icon: PawPrint,
    label: "Pet Care",
    count: 445,
  },
  {
    icon: Briefcase,
    label: "Professional",
    count: 367,
  },
];

export function Categories() {
  return (
    <section id="categories" className="w-full py-24 md:py-32 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
            Explore
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A1A1A] mb-4 tracking-tight">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
            Find the perfect service from our wide range of categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:grid-flow-col md:grid-rows-4 lg:grid-rows-2 gap-8">
          {categories.map((category) => (
            <div
              key={category.label}
              className="
        bg-white
        border border-gray-200
        rounded-2xl
        p-10
        flex flex-col items-center justify-center
        text-center
        gap-4
        transition-colors
        hover:border-primary/40
        cursor-pointer
        h-full
      "
            >
              {/* Icon */}
              <div className="text-gray-500 group-hover:text-primary transition-colors">
                <category.icon className="w-8 h-8 stroke-[1.5]" />
              </div>

              {/* Label */}
              <h3 className="font-serif text-lg font-semibold text-[#1A1A1A]">
                {category.label}
              </h3>

              {/* Count */}
              <p className="text-sm text-gray-400">{category.count} services</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
