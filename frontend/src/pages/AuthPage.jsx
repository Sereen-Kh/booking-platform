import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';

export default function AuthPage({ mode = 'login' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                // Handle registration logic here
            }
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors">
            <Card className="w-full max-w-md border border-border shadow-2xl rounded-3xl overflow-hidden bg-card transition-colors">
                <CardHeader className="space-y-1 pb-8 text-center bg-gradient-to-b from-muted/50 to-card pt-10">
                    <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                        {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
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
                        <Button className="w-full h-12 rounded-xl text-lg font-semibold mt-4 shadow-lg shadow-primary/20" type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
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
        </div>
    );
}
