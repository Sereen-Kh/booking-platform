import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Moon, Sun, Calendar, Clock, Search, MapPin, Star, ShieldCheck, User, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"


export default function ServiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isActive } = useAuth();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const data = await api.services.get(id);
                setService(data);
            } catch (error) {
                console.error('Failed to load service:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

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

    return (
        <div className="bg-background min-h-screen transition-colors">
            <div className="container px-4 py-12 max-w-6xl">
                {/* Breadcrumb could go here */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{service.name}</h1>
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
                                    <span className="text-emerald-600 font-medium">Verified Provider</span>
                                </div>
                            </div>
                        </div>

                        <div className="aspect-video bg-muted rounded-3xl overflow-hidden shadow-inner flex items-center justify-center text-muted-foreground/50 font-medium text-lg italic">
                            Professional imaging of {service.name}
                        </div>

                        <div className="bg-card p-8 rounded-3xl shadow-sm border border-border space-y-4 transition-colors">
                            <h2 className="text-2xl font-bold text-foreground">About this service</h2>
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
                            <CardHeader className="bg-foreground text-background p-6 transition-colors">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">${service.price}</span>
                                    <span className="text-muted-foreground/60 text-sm">/ session</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-foreground">Select Date & Time</h3>
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border cursor-pointer hover:border-primary transition-colors">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-sm font-medium">Choose a date...</span>
                                    </div>
                                </div>

                                <div className="space-y-2 py-4 border-y border-border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Service Fee</span>
                                        <span className="text-foreground">$0.00</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-foreground">
                                        <span>Total</span>
                                        <span>${service.price}</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                                    onClick={() => isActive ? navigate(`/checkout/${service.id}`) : navigate('/login')}
                                >
                                    Reserve Appointment
                                </Button>
                                <p className="text-center text-xs text-slate-400">You won't be charged yet</p>
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
