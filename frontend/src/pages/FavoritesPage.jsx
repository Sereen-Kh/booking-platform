import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Star, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
    const { favorites, loading, removeFavorite } = useFavorites();
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="container px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Please log in to view favorites</h1>
                <Link to="/login">
                    <Button>Login</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-colors">
            <section className="container px-4 py-16">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="w-8 h-8 text-primary fill-primary" />
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">
                        My Favorites
                    </h1>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">Loading favorites...</p>
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((service) => (
                            <Card key={service.id} className="overflow-hidden border border-border/40 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-card h-full">
                                <div className="h-40 bg-muted relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-bold text-4xl uppercase tracking-widest bg-gradient-to-br from-muted to-background/50">
                                        {service.name?.substring(0, 1)}
                                    </div>
                                    <button
                                        onClick={() => removeFavorite(service.id)}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all hover:scale-110"
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </button>
                                </div>
                                <CardHeader className="p-5 pb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-md ${service.price === 0 ? 'text-emerald-600 bg-emerald-100' : 'text-primary bg-primary/10'}`}>
                                            {service.price === 0 ? 'Free' : `$${service.price}`}
                                        </span>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-sm font-bold">4.9</span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg font-bold font-heading text-foreground leading-tight">
                                        {service.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 pt-0">
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {service.description}
                                    </p>
                                    <Link to={`/services/${service.id}`}>
                                        <Button className="w-full rounded-xl">
                                            {service.price === 0 ? 'Apply for Free' : 'View Details'}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No favorites yet</h3>
                        <p className="text-muted-foreground mb-6">Browse services and save your favorites!</p>
                        <Link to="/">
                            <Button>Explore Services</Button>
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
