import React, { useState, useEffect } from 'react';
import { servicesAPI } from '@/utils/api';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Star, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setLoading(true);
        try {
            const data = await servicesAPI.getRecommended(8);
            setServices(data || []);
        } catch (error) {
            console.error('Failed to load services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteClick = async (e, serviceId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        await toggleFavorite(serviceId);
    };

    return (
        <div className="min-h-screen bg-background transition-colors">
            {/* Hero Section */}
            <section className="bg-card border-b pt-16 pb-24 transition-colors">
                <div className="container px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight text-foreground mb-6">
                        Expert services, <br />
                        <span className="text-primary animate-pulse">booked in seconds.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Find the best professional services for your home and business.
                        Trusted by thousands of happy customers.
                    </p>

                    <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3 p-2 bg-card rounded-2xl shadow-2xl shadow-primary/5 border border-border">
                        <div className="flex-1 flex items-center px-4 gap-2">
                            <Search className="text-muted-foreground w-5 h-5" />
                            <Input
                                placeholder="What service do you need?"
                                className="border-none shadow-none focus-visible:ring-0 text-lg py-6 bg-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-px h-10 bg-border hidden md:block self-center" />
                        <div className="flex-1 flex items-center px-4 gap-2">
                            <MapPin className="text-muted-foreground w-5 h-5" />
                            <Input
                                placeholder="Location"
                                className="border-none shadow-none focus-visible:ring-0 text-lg py-6 bg-transparent"
                            />
                        </div>
                        <Button size="lg" className="rounded-xl px-8 text-lg font-semibold h-14 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            Search
                        </Button>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="container px-4 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight">Recommended Services</h2>
                    <Link to="/services">
                        <Button variant="ghost" className="text-muted-foreground hover:text-primary">View all</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="space-y-3 p-4 bg-card rounded-2xl border border-border">
                                <Skeleton className="h-48 w-full rounded-xl" />
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                                <div className="flex justify-between items-center pt-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            </div>
                        ))
                    ) : services.length > 0 ? (
                        services.map((service) => (
                            <Link to={`/services/${service.id}`} key={service.id} className="block group">
                                <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 rounded-2xl cursor-pointer bg-card h-full transform group-hover:-translate-y-1">
                                    <div className="h-48 bg-muted relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-bold text-4xl uppercase tracking-widest bg-gradient-to-br from-muted to-background/50 group-hover:scale-105 transition-transform duration-500">
                                            {service.name.substring(0, 1)}
                                        </div>
                                        {/* Favorite Heart Button */}
                                        <button
                                            onClick={(e) => handleFavoriteClick(e, service.id)}
                                            className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all hover:scale-110 ${isFavorite(service.id)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-white/80 hover:bg-white text-muted-foreground'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isFavorite(service.id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                    <CardHeader className="p-5 pb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-md ${service.price === 0
                                                    ? 'text-emerald-600 bg-emerald-100'
                                                    : 'text-primary bg-primary/10'
                                                }`}>
                                                {service.price === 0 ? 'Free' : `$${service.price}`}
                                            </span>
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="text-sm font-bold">4.9</span>
                                            </div>
                                        </div>
                                        <CardTitle className="text-lg font-bold font-heading text-foreground leading-tight group-hover:text-primary transition-colors">{service.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0">
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 min-h-[40px]">
                                            {service.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-black text-foreground font-mono transition-colors">
                                                    {service.price === 0 ? 'Free' : `$${service.price}`}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Per session</span>
                                            </div>
                                            <Button size="sm" className="rounded-xl px-5 font-bold shadow-lg shadow-primary/20">
                                                {service.price === 0 ? 'Apply' : 'Book'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="mb-4 inline-flex p-4 rounded-full bg-muted text-muted-foreground font-bold">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No results matching your search</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or search keywords.</p>
                            <Button variant="link" className="mt-4 font-bold text-primary" onClick={loadServices}>Show all services</Button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
