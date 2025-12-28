import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const { user, logout, isActive } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="container px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">BookIt</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
          <Link to="/providers" className="hover:text-primary transition-colors">Become a Provider</Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-4 w-px bg-border mx-1" />
          {isActive ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/register')} className="rounded-xl">Get Started</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
