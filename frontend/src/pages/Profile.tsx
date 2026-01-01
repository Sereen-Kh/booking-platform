import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Mail, Phone, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { profilesAPI } from '@/utils/api';

interface Profile {
    id: string;
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    email?: string;
}

export default function ProfilePage() {
    const { user, loading: authLoading, logout: signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const data = await profilesAPI.get(user.id);
                setProfile(data);
                setFullName(data.full_name || '');
                setPhone(data.phone || '');
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load profile. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user, toast]);

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        try {
            await profilesAPI.update(user.id, {
                full_name: fullName,
                phone: phone,
            });

            toast({
                title: 'Profile updated',
                description: 'Your profile has been saved successfully.',
            });

            // Update local state to reflect changes
            setProfile(prev => prev ? { ...prev, full_name: fullName, phone: phone } : null);

        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Error',
                description: 'Failed to update profile. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
        toast({
            title: 'Signed out',
            description: 'You have been signed out successfully.',
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const initials = fullName
        ? fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                            <Calendar className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl text-foreground">BookFlow</span>
                    </a>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <a
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </a>

                <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-md">
                    <h1 className="text-2xl font-bold text-foreground mb-6">Your Profile</h1>

                    {/* Avatar Section */}
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-xl gradient-hero text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold text-foreground">{fullName || 'Your Name'}</h2>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="pl-10 h-12 bg-muted"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>

                        <Button
                            variant="hero"
                            size="lg"
                            className="w-full h-12"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
