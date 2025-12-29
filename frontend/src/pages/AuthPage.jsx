import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AuthPage({ mode = 'login' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isProvider, setIsProvider] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(name, email, password, isProvider ? 'provider' : 'customer');
            }
            navigate(isProvider ? '/provider/services' : '/dashboard');
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-0 transition-colors relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl" />
            </div>

            <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-2">
                {/* Left Side - Auth Form */}
                <div className="flex flex-col items-center justify-center p-8 lg:p-16 relative">
                    <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                {mode === 'login' ? <User className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                                {mode === 'login' ? 'Welcome back' : 'Create account'}
                            </h1>
                            <p className="text-muted-foreground text-base">
                                {mode === 'login'
                                    ? 'Enter your credentials to access your account'
                                    : 'Enter your details to start booking expert services'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'register' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground" htmlFor="name">Full Name</label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        className="rounded-xl h-12 bg-muted/20 border-border"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="email">Email address</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="rounded-xl h-12 bg-muted/20 border-border"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
                                    {mode === 'login' && (
                                        <Link to="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    className="rounded-xl h-12 bg-muted/20 border-border"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {mode === 'register' && (
                                <div className="flex items-center space-x-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="isProvider"
                                        checked={isProvider}
                                        onChange={(e) => setIsProvider(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isProvider" className="text-sm font-medium text-foreground cursor-pointer">
                                        Join as a Service Provider
                                    </label>
                                </div>
                            )}
                            <Button
                                className="w-full h-12 rounded-xl text-lg font-semibold mt-4 shadow-lg shadow-primary/20"
                                type="submit"
                                isLoading={isLoading}
                            >
                                {mode === 'login' ? 'Sign In' : 'Sign Up'}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-muted-foreground">
                            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                            <Link
                                to={mode === 'login' ? '/register' : '/login'}
                                className="text-primary font-bold hover:underline"
                            >
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side - Branding Image */}
                <div className="hidden lg:block relative overflow-hidden bg-primary/95 text-primary-foreground">
                    <img
                        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-16 bg-gradient-to-t from-black/80 to-transparent">
                        <blockquote className="space-y-2">
                            <p className="text-lg font-medium leading-relaxed">
                                "The platform has completely transformed how I manage my bookings. It's elegant, fast, and incredibly easy to use."
                            </p>
                            <footer className="text-sm font-semibold opacity-80">
                                Sofia Davis — Hospitality Manager
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    );
}
