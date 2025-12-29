import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, User, LogOut, LayoutDashboard } from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const { user, logout, isActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if we are on the landing page to apply special transparency rules
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled || !isLandingPage
      ? 'bg-background/80 backdrop-blur-md border-border shadow-sm py-2'
      : 'bg-transparent border-transparent py-4'
    }`;

  const linkClasses = `text-sm font-medium transition-colors ${isScrolled || !isLandingPage
      ? 'text-muted-foreground hover:text-primary'
      : 'text-white/90 hover:text-white'
    }`;

  const logoClasses = `flex items-center gap-2 text-xl font-bold font-heading tracking-tight transition-colors ${isScrolled || !isLandingPage ? 'text-foreground' : 'text-white'
    }`;

  return (
    <nav className={navbarClasses}>
      <div className="container px-4 h-14 flex items-center justify-between">
        <Link to="/" className={logoClasses}>
          <img 
            src="/bookit-monogram.svg" 
            alt="BookIt Logo" 
            className="w-8 h-8 rounded-lg"
          />
          <span>BookIt</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/services" className={linkClasses}>Services</Link>
          <Link to="/favorites" className={linkClasses}>Favorites</Link>
          <Link to="/providers" className={linkClasses}>Become a Provider</Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className={isScrolled || !isLandingPage ? "" : "text-white hover:text-white hover:bg-white/20"} />

          <div className={`h-4 w-px mx-1 ${isScrolled || !isLandingPage ? 'bg-border' : 'bg-white/30'}`} />

          {isActive ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className={isScrolled || !isLandingPage ? "text-muted-foreground" : "text-white hover:bg-white/20 hover:text-white"}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                size="sm"
                variant={isScrolled || !isLandingPage ? "default" : "secondary"}
                onClick={logout}
                className="rounded-full px-6"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className={isScrolled || !isLandingPage ? "text-muted-foreground" : "text-white hover:bg-white/20 hover:text-white"}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className={`rounded-full px-6 font-semibold ${isScrolled || !isLandingPage ? '' : 'bg-white text-primary hover:bg-white/90'}`}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
