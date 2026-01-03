import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  DollarSign,
  Settings,
  Plus,
  Home,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

export default function ProviderDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role !== 'provider') {
        navigate('/');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading, navigate]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Briefcase className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Provider Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.full_name || user?.email}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No services yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No bookings yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">No revenue yet</p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Complete your provider profile to start offering services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Add your business name, description, and location to help customers find you
                </p>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Profile
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg opacity-60">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Add Your First Service</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create service listings with pricing and availability
                </p>
                <Button variant="outline" size="sm" disabled>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg opacity-60">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Manage Your Availability</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Set your working hours and manage bookings
                </p>
                <Button variant="outline" size="sm" disabled>
                  <Calendar className="w-4 h-4 mr-2" />
                  Set Availability
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
