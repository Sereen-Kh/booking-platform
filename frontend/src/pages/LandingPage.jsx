import React, { useState, useEffect } from 'react';
import { servicesAPI } from '@/utils/api';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Star, Heart, Calendar, ArrowRight } from 'lucide-react';
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
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            {/* Hero Section */}
            <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
                {/* Animated background decoration */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-20 -left-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 float" />
                    <div className="absolute bottom-0 -right-40 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 float" style={{animationDelay: '-2s'}} />
                </div>

                <div className="container relative z-10 px-4 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 slide-up" style={{animationDelay: '0.1s'}}>
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Book with confidence</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading text-foreground mb-6 drop-shadow-sm tracking-tight slide-up" style={{animationDelay: '0.2s'}}>
                        Schedule <br className="hidden md:block" />
                        <span className="relative inline-block">
                            Your Perfect
                            <svg className="absolute -bottom-3 lg:-bottom-4 left-0 w-full h-3 lg:h-4 text-accent" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path fill="currentColor" d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z" />
                            </svg>
                        </span>
                        {' '}Service
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl font-medium slide-up" style={{animationDelay: '0.3s'}}>
                        Discover trusted professionals and book services that fit your schedule. Simple, transparent, and reliable.
                    </p>

                    {/* Glassmorphism Search Widget */}
                    <div className="w-full max-w-4xl p-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] slide-up flex flex-col md:flex-row gap-2" style={{animationDelay: '0.4s'}}>
                        <div className="flex-1 flex items-center px-6 h-14 md:h-16 relative group">
                            <Search className="text-muted-foreground w-5 h-5 mr-3 group-focus-within:text-primary transition-colors" />
                            <div className="flex flex-col flex-1 justify-center h-full">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 text-left">Service</label>
                                <input
                                    placeholder="What do you need?"
                                    className="w-full bg-transparent border-none outline-none text-foreground font-medium placeholder:text-muted-foreground/50 h-6"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-px h-10 bg-border hidden md:block self-center" />

                        <div className="flex-1 flex items-center px-6 h-14 md:h-16 relative group">
                            <Calendar className="text-muted-foreground w-5 h-5 mr-3 group-focus-within:text-primary transition-colors" />
                            <div className="flex flex-col flex-1 justify-center h-full">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 text-left">Date</label>
                                <input
                                    placeholder="When?"
                                    type="date"
                                    className="w-full bg-transparent border-none outline-none text-foreground font-medium placeholder:text-muted-foreground/50 h-6"
                                />
                            </div>
                        </div>

                        <Button size="lg" className="rounded-full h-14 md:h-16 px-10 text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300">
                            Browse
                        </Button>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 text-foreground text-sm font-medium slide-up" style={{animationDelay: '0.5s'}}>
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 fill-accent text-accent" />
                            <span className="font-semibold">4.9/5 Rating</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">1000+</span>
                            <span>Services</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">24/7</span>
                            <span>Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="container px-4 py-20">
                <div className="flex items-end justify-between mb-12">
                    <div className="slide-up">
                        <h2 className="text-4xl font-bold font-heading text-foreground mb-3">Recommended for you</h2>
                        <p className="text-muted-foreground text-lg">Handpicked best services based on your preferences</p>
                    </div>
                    <Link to="/services">
                        <Button variant="outline" className="hidden md:flex gap-2 rounded-full border-border hover:bg-primary/5 hover:text-primary transition-all slide-up" style={{animationDelay: '0.1s'}}>
                            View all <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : services.length > 0 ? (
                        services.map((service, i) => (
                            <Link to={`/services/${service.id}`} key={service.id} className="group block h-full slide-up" style={{animationDelay: `${0.1 * (i % 4)}s`}}>
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-primary/20 to-accent/20 shadow-soft group-hover:shadow-glow transition-all duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-muted-foreground font-bold text-6xl select-none group-hover:scale-110 transition-transform duration-500 ease-out">
                                        {service.name.charAt(0)}
                                    </div>

                                    <button
                                        onClick={(e) => handleFavoriteClick(e, service.id)}
                                        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-soft hover:bg-white hover:shadow-lg hover:scale-110 transition-all active:scale-95"
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite(service.id) ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                                    </button>

                                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/95 backdrop-blur shadow-soft">
                                        <Star className="w-4 h-4 fill-accent text-accent" />
                                        <span className="text-sm font-bold text-foreground">4.92</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                            {service.name}
                                        </h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-2">{service.description}</p>
                                    <div className="flex items-baseline gap-2 pt-1">
                                        <span className="font-bold text-lg text-foreground">
                                            {service.price === 0 ? 'Free' : `$${service.price}`}
                                        </span>
                                        {service.price > 0 && <span className="text-muted-foreground text-sm">per session</span>}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center bg-secondary/30 rounded-3xl border border-dashed border-border">
                            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-muted-foreground">
                                <Search className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-1">No services found</h3>
                            <p className="text-muted-foreground mb-6">We couldn't find any services matching your criteria.</p>
                            <Button onClick={loadServices} variant="outline" className="rounded-full">Refresh Grid</Button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
