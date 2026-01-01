import {
  Home,
  Scissors,
  Heart,
  Car,
  Dumbbell,
  Camera,
  PawPrint,
  Briefcase
} from "lucide-react";

const categories = [
  { icon: Home, label: "Home Services", count: 1240, color: "hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30" },
  { icon: Scissors, label: "Beauty & Spa", count: 856, color: "hover:bg-pink-500/10 hover:text-pink-600 hover:border-pink-500/30" },
  { icon: Heart, label: "Wellness", count: 623, color: "hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30" },
  { icon: Car, label: "Automotive", count: 412, color: "hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30" },
  { icon: Dumbbell, label: "Fitness", count: 534, color: "hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30" },
  { icon: Camera, label: "Photography", count: 298, color: "hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30" },
  { icon: PawPrint, label: "Pet Care", count: 445, color: "hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-500/30" },
  { icon: Briefcase, label: "Professional", count: 367, color: "hover:bg-cyan-500/10 hover:text-cyan-600 hover:border-cyan-500/30" },
];

export function Categories() {
  return (
    <section id="categories" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Explore</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the perfect service from our wide range of categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {categories.map((category, index) => (
            <button
              key={category.label}
              className={`group p-6 bg-card rounded-2xl border border-border text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-up ${category.color}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <category.icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:scale-110 transition-all duration-300" />
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-inherit transition-colors">
                {category.label}
              </h3>
              <p className="text-sm text-muted-foreground">{category.count} services</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
