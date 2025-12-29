import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function BookingCancelPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                    <XCircle className="w-16 h-16 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold font-heading text-foreground">
                    Payment Cancelled
                </h1>

                <p className="text-muted-foreground text-lg">
                    Your payment was cancelled. No charges were made.
                </p>

                <div className="flex flex-col gap-3 pt-4">
                    <Link to="/">
                        <Button className="w-full rounded-xl h-12">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Services
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
