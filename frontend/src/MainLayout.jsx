import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="border-t border-border py-12 bg-card transition-colors">
                <div className="container px-4 text-center text-muted-foreground text-sm">
                    © 2025 BookIt Platform. All rights reserved. Built with FastAPI and React.
                </div>
            </footer>
        </div>
    );
}
