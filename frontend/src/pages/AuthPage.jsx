import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { servicesAPI } from '@/utils/api';
import { User, ShieldCheck } from 'lucide-react';

export default function AuthPage({ mode = 'login' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isProvider, setIsProvider] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedServices, setRecommendedServices] = useState([]);

    useEffect(() => {
        loadRecommendedServices();
    }, []);

    const loadRecommendedServices = async () => {
        try {
            const data = await servicesAPI.getRecommended(3);
            setRecommendedServices(data);
        } catch (err) {
            console.error("Failed to load recommended services", err);
        }
    };

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
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl" />
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Auth Form */}
                <Card className="w-full border border-border/50 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl transition-all duration-500 hover:shadow-primary/5">
                    <CardHeader className="space-y-1 pb-8 text-center bg-gradient-to-b from-primary/5 to-transparent pt-10">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary animate-in zoom-in duration-500">
                            {mode === 'login' ? <User className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-foreground font-heading">
                            {mode === 'login' ? 'Welcome back' : 'Create account'}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-base">
                            {mode === 'login'
                                ? 'Enter your credentials to access your account'
                                : 'Enter your details to start booking expert services'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
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
                    </CardContent>
                    <CardFooter className="bg-muted/30 px-8 py-6 border-t border-border flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                            <Link
                                to={mode === 'login' ? '/register' : '/login'}
                                className="text-primary font-bold hover:underline"
                            >
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                {/* Recommended Services */}
                <div className="hidden lg:flex flex-col justify-center">
                    <Card className="border border-border rounded-3xl overflow-hidden bg-gradient-to-br from-muted/50 to-card">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                Popular Services
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Discover what others are booking
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recommendedServices.map((service) => (
                                    <div key={service.id} className="p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-foreground">{service.name}</h4>
                                            <span className="text-primary font-bold">${service.price}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                            {service.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>⏱️ {service.duration_minutes} min</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => navigate('/services')}
                            >
                                Browse All Services
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
