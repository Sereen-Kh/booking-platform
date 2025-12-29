import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { servicesAPI } from "@/utils/api.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Calendar, DollarSign, Clock, MapPin } from "lucide-react";

export default function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category_id: "",
    min_price: "",
    max_price: "",
    search: ""
  });

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  useEffect(() => {
    // Debounced search
    const timer = setTimeout(() => {
      loadServices();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category_id && filters.category_id !== "all") params.append("category_id", filters.category_id);
      if (filters.min_price) params.append("min_price", filters.min_price);
      if (filters.max_price) params.append("max_price", filters.max_price);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(
        `http://localhost:8000/api/v1/services/?${params.toString()}`
      );
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError("Failed to load services");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/services/categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category_id: "",
      min_price: "",
      max_price: "",
      search: ""
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-10">
      <div className="container px-4">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground tracking-tight">
            Explore Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and book the best professionals for your needs.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search services..."
                className="pl-10 h-12 bg-background border-input rounded-xl"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <div className="w-full md:w-[200px]">
              <select
                className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filters.category_id}
                onChange={(e) => handleFilterChange("category_id", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-[120px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">$</span>
                <Input
                  type="number"
                  placeholder="Min"
                  className="pl-6 h-12 bg-background border-input rounded-xl"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange("min_price", e.target.value)}
                />
              </div>
              <div className="relative flex-1 md:w-[120px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">$</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="pl-6 h-12 bg-background border-input rounded-xl"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange("max_price", e.target.value)}
                />
              </div>
            </div>

            {(filters.category_id || filters.min_price || filters.max_price || filters.search) && (
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-destructive">
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && services.length === 0 && (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading expert services...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-destructive font-medium">
            {error}
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {!loading && services.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-muted/30 rounded-3xl border border-dashed border-border">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-1">No services found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="group overflow-hidden rounded-2xl border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full bg-card">
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground/30 font-bold text-4xl">
                      {service.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      {service.duration_minutes}m
                    </div>
                  </div>
                </div>

                <CardContent className="flex-1 p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <span className="font-bold text-primary shrink-0 ml-2">
                      ${service.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <div className="inline-flex items-center text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                      {categories.find(c => c.id === service.category_id)?.name || "Service"}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 mt-auto">
                  <Button
                    className="w-full h-11 rounded-xl shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-all"
                    onClick={() => navigate(`/services/${service.id}`)}
                  >
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}