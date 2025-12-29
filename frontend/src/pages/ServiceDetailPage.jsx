import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesAPI, paymentsAPI } from '@/utils/api';
import { useFavorites } from '@/context/FavoritesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, Star, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function ServiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const fetchService = async () => {
            try {
                const data = await servicesAPI.getById(id);
                setService(data);
            } catch (error) {
                console.error('Failed to load service:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!selectedDate) {
            alert('Please select a date and time');
            return;
        }

        setBookingLoading(true);
        try {
            const result = await paymentsAPI.createCheckout(service.id, selectedDate);

            if (result.type === 'free') {
                // Free service - booking created directly
                navigate(`/booking/success?booking_id=${result.booking_id}`);
            } else if (result.type === 'paid') {
                // Paid service - redirect to Stripe
                window.location.href = result.checkout_url;
            }
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Failed to process booking. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleFavoriteClick = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        await toggleFavorite(service.id);
    };

    if (loading) {
        return (
            <div className="container px-4 py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-[400px] w-full rounded-3xl" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-[500px] rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!service) return <div className="text-center py-20">Service not found</div>;

    const isFree = service.price === 0;

    return (
        <div className="bg-background min-h-screen transition-colors">
            <div className="container px-4 py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <h1 className="text-4xl font-extrabold font-heading tracking-tight text-foreground">{service.name}</h1>
                                <button
                                    onClick={handleFavoriteClick}
                                    className={`p-3 rounded-full shadow-sm transition-all hover:scale-110 ${isFavorite(service.id)
                                        ? 'bg-red-500 text-white'
                                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite(service.id) ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1 text-amber-500 font-bold">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>4.9 (128 reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>San Francisco, CA</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <span className="text-emerald-600 font-medium whitespace-nowrap">Verified Provider</span>
                                </div>
                                <div className="h-4 w-px bg-border mx-1 hidden sm:block"></div>
                                <Link
                                    to={`/provider/${service.provider_id}`}
                                    className="flex items-center gap-2 group/provider hover:text-primary transition-colors"
                                >
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                        {service.provider?.full_name?.[0] || 'P'}
                                    </div>
                                    <span className="font-semibold underline underline-offset-4 decoration-primary/30 group-hover/provider:decoration-primary">
                                        {service.provider?.full_name || 'Expert Provider'}
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <div className="aspect-video bg-muted rounded-3xl overflow-hidden shadow-inner flex items-center justify-center text-muted-foreground/50 font-medium text-lg italic transition-all group relative">
                            {service.image_url ? (
                                <img
                                    src={service.image_url}
                                    alt={service.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                                />
                            ) : (
                                `Professional imaging of ${service.name}`
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="bg-card p-8 rounded-3xl shadow-sm border border-border space-y-4 transition-colors">
                            <h2 className="text-2xl font-bold font-heading text-foreground">About this service</h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {service.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</p>
                                        <p className="font-bold text-foreground">{service.duration_minutes} minutes</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl">
                                    <Star className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience</p>
                                        <p className="font-bold text-foreground">Elite Professional</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="lg:sticky lg:top-24">
                        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-card transition-colors">
                            <CardHeader className={`p-6 transition-colors ${isFree ? 'bg-emerald-500 text-white' : 'bg-foreground text-background'}`}>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">{isFree ? 'Free' : `$${service.price}`}</span>
                                    {!isFree && <span className="text-muted-foreground/60 text-sm">/ session</span>}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-foreground">Select Date & Time</h3>
                                    <input
                                        type="datetime-local"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full p-3 bg-muted/50 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-2 py-4 border-y border-border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Service Fee</span>
                                        <span className="text-foreground">$0.00</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-foreground">
                                        <span>Total</span>
                                        <span>{isFree ? 'Free' : `$${service.price}`}</span>
                                    </div>
                                </div>

                                <Button
                                    className={`w-full h-14 rounded-2xl text-lg font-bold shadow-lg ${isFree
                                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                                        : 'shadow-primary/20'
                                        }`}
                                    onClick={handleBooking}
                                    disabled={bookingLoading}
                                    isLoading={bookingLoading}
                                >
                                    {isFree ? 'Apply for Free' : `Pay $${service.price}`}
                                </Button>
                                <p className="text-center text-xs text-muted-foreground">
                                    {isFree ? 'Confirmation will be sent to your email' : 'Secure payment via Stripe'}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="mt-6 p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20 flex gap-4">
                            <div className="h-10 w-10 bg-amber-500/20 rounded-full flex-shrink-0 flex items-center justify-center">
                                <Star className="w-5 h-5 text-amber-500 fill-current" />
                            </div>
                            <div>
                                <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">Rare find</p>
                                <p className="text-amber-600/80 dark:text-amber-400/80 text-xs mt-0.5">This provider usually books up 2 weeks in advance.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
