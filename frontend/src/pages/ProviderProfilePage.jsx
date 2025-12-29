import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesAPI, providersAPI } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, ShieldCheck, Mail, Calendar } from 'lucide-react';

export default function ProviderProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileData, servicesData] = await Promise.all([
                    providersAPI.getProfileByUserId(userId),
                    servicesAPI.getByProvider(userId)
                ]);
                setProfile(profileData);
                setServices(servicesData);
            } catch (error) {
                console.error('Failed to load provider profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [userId]);

    if (loading) {
        return (
            <div className="container px-4 py-12 max-w-6xl space-y-8">
                <Skeleton className="h-64 w-full rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (!profile) return <div className="text-center py-20">Provider not found</div>;

    return (
        <div className="bg-background min-h-screen">
            {/* Header / Hero Section */}
            <div className="bg-gradient-to-br from-primary/10 via-background to-muted/20 border-b border-border">
                <div className="container px-4 py-16 max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        <div className="h-32 w-32 rounded-3xl bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold shadow-xl border-4 border-background">
                            {profile.business_name?.[0] || 'P'}
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                                    {profile.business_name || 'Expert Provider'}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span>4.9 (50+ bookings)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{profile.location || 'San Francisco, CA'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span className="text-emerald-600 font-medium">Verified Provider</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                {profile.bio || "Bringing expert services directly to you. We pride ourselves on quality, reliability, and customer satisfaction."}
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                                <Button variant="outline" className="rounded-xl">
                                    <Mail className="w-4 h-4 mr-2" /> Contact
                                </Button>
                                <Button variant="ghost" className="rounded-xl">
                                    <ShieldCheck className="w-4 h-4 mr-2" /> View Certifications
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <div className="container px-4 py-16 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Our Services</h2>
                    <span className="text-muted-foreground font-medium">{services.length} services available</span>
                </div>

                {services.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground">No services listed yet</h3>
                        <p className="text-muted-foreground">This provider hasn't published any services to their store.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <Link key={service.id} to={`/services/${service.id}`} className="block group">
                                <Card className="h-full border border-border shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group-hover:-translate-y-1">
                                    <div className="aspect-video bg-muted relative overflow-hidden">
                                        {service.image_url ? (
                                            <img
                                                src={service.image_url}
                                                alt={service.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-bold italic">
                                                {service.name}
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary shadow-sm">
                                            ${service.price}
                                        </div>
                                    </div>
                                    <CardHeader className="p-6">
                                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                            {service.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 pt-0">
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                            {service.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-4 border-t border-border">
                                            <div className="flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span>4.9</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{service.duration_minutes} min</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
