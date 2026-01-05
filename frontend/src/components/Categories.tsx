import {
  Home,
  Scissors,
  Heart,
  Car,
  Dumbbell,
  Camera,
  PawPrint,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Category {
  id: number;
  name: string;
  service_count: number;
  icon?: string;
  color?: string;
}

const iconMap: Record<string, any> = {
  Home,
  Scissors,
  Heart,
  Car,
  Dumbbell,
  Camera,
  PawPrint,
  Briefcase,
};

const colorMap: Record<string, string> = {
  blue: "hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30",
  pink: "hover:bg-pink-500/10 hover:text-pink-600 hover:border-pink-500/30",
  red: "hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30",
  amber: "hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30",
  emerald:
    "hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30",
  purple:
    "hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30",
  orange:
    "hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-500/30",
  cyan: "hover:bg-cyan-500/10 hover:text-cyan-600 hover:border-cyan-500/30",
};

export function Categories() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const isProvider = user?.role === "provider" || user?.role === "PROVIDER";

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/services/categories");
      let categoriesData = response.data || [];

      // If provider, filter to only show categories where they have services
      if (isProvider) {
        categoriesData = categoriesData.filter(
          (cat: Category) => cat.service_count > 0
        );
      }

      setCategories(categoriesData);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (categoryName: string) => {
    // Map category names to icons
    if (categoryName.toLowerCase().includes("home")) return Home;
    if (
      categoryName.toLowerCase().includes("beauty") ||
      categoryName.toLowerCase().includes("spa")
    )
      return Scissors;
    if (
      categoryName.toLowerCase().includes("wellness") ||
      categoryName.toLowerCase().includes("health")
    )
      return Heart;
    if (
      categoryName.toLowerCase().includes("automotive") ||
      categoryName.toLowerCase().includes("car")
    )
      return Car;
    if (
      categoryName.toLowerCase().includes("fitness") ||
      categoryName.toLowerCase().includes("gym")
    )
      return Dumbbell;
    if (categoryName.toLowerCase().includes("photo")) return Camera;
    if (categoryName.toLowerCase().includes("pet")) return PawPrint;
    return Briefcase; // Default icon
  };

  const getColor = (index: number) => {
    const colors = Object.values(colorMap);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <section id="categories" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section id="categories" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              {isProvider ? "No Categories Yet" : "No Categories Available"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isProvider
                ? "You haven't created services in any categories yet."
                : "No categories available at the moment."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {isProvider ? "Your Categories" : "Explore"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isProvider
              ? `Categories where you have services (${categories.length})`
              : "Find the perfect service from our wide range of categories"}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {categories.map((category, index) => {
            const Icon = getIcon(category.name);
            const colorClass = getColor(index);

            return (
              <button
                key={category.id}
                className={`group p-6 bg-card rounded-2xl border border-border text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-up ${colorClass}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/categories?category=${category.id}`)}
              >
                <Icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:scale-110 transition-all duration-300" />
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-inherit transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.service_count} service
                  {category.service_count !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
