import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

export default function BookingSuccessPage() {
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('booking_id');
    const sessionId = searchParams.get('session_id');

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                </div>

                <h1 className="text-3xl font-bold font-heading text-foreground">
                    Booking Confirmed!
                </h1>

                <p className="text-muted-foreground text-lg">
                    Your service has been successfully booked.
                    {bookingId && ` Booking ID: #${bookingId}`}
                </p>

                <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                    <div className="flex items-center gap-3 justify-center text-muted-foreground">
                        <Calendar className="w-5 h-5" />
                        <span>Check your email for confirmation details</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link to="/dashboard">
                        <Button className="w-full rounded-xl h-12">
                            View My Bookings
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button variant="ghost" className="w-full">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
