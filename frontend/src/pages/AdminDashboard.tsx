import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Briefcase,
    Settings,
    Shield,
    Menu,
    Home,
    Loader2,
    UserCheck,
    UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/utils/api';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

type Tab = 'users' | 'providers' | 'settings';

interface UserWithRole {
    id: string;
    user_id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    role: AppRole;
    created_at: string;
}

const menuItems = [
    { title: 'Users', value: 'users' as Tab, icon: Users },
    { title: 'Providers', value: 'providers' as Tab, icon: Briefcase },
    { title: 'Settings', value: 'settings' as Tab, icon: Settings },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('users');
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);

    const { user, loading: authLoading } = useAuth();
    const { isAdmin, loading: roleLoading } = useUserRole();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
        } else if (!authLoading && !roleLoading && !isAdmin) {
            toast({
                title: 'Access Denied',
                description: 'You do not have permission to access this page.',
                variant: 'destructive',
            });
            navigate('/');
        }
    }, [user, authLoading, isAdmin, roleLoading, navigate, toast]);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const fetchUsers = async () => {
        setLoadingData(true);

        try {
            const data = await adminAPI.getUsers();
            // Assuming the API returns the users with roles directly
            // Adjust mapping based on actual API response structure
            const mappedUsers: UserWithRole[] = Array.isArray(data) ? data.map((u: any) => ({
                id: u.id,
                user_id: u.id, // API likely returns id as the user_id
                full_name: u.full_name,
                email: u.email,
                avatar_url: u.avatar_url,
                role: u.role || 'user',
                created_at: u.created_at || new Date().toISOString(),
            })) : [];

            setUsers(mappedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch users.',
                variant: 'destructive',
            });
        } finally {
            setLoadingData(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: AppRole) => {
        setUpdatingRole(userId);

        try {
            await adminAPI.updateUserRole(userId, newRole);

            toast({
                title: 'Role Updated',
                description: `User role has been changed to ${newRole}.`,
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            toast({
                title: 'Error',
                description: 'Failed to update user role.',
                variant: 'destructive',
            });
        } finally {
            setUpdatingRole(null);
        }
    };

    const filteredUsers = activeTab === 'providers'
        ? users.filter(u => u.role === 'provider')
        : users;

    if (authLoading || roleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <Sidebar className="border-r">
                    <SidebarContent className="pt-4">
                        <div className="px-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Shield className="w-6 h-6 text-primary" />
                                <span className="font-bold text-lg">Admin Panel</span>
                            </div>
                        </div>

                        <SidebarGroup>
                            <SidebarGroupLabel>Management</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {menuItems.map((item) => (
                                        <SidebarMenuItem key={item.value}>
                                            <SidebarMenuButton
                                                onClick={() => setActiveTab(item.value)}
                                                className={activeTab === item.value ? 'bg-primary/10 text-primary' : ''}
                                            >
                                                <item.icon className="w-4 h-4 mr-2" />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarGroup className="mt-auto">
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton onClick={() => navigate('/')}>
                                            <Home className="w-4 h-4 mr-2" />
                                            <span>Back to Site</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>

                <main className="flex-1 p-6">
                    <header className="flex items-center gap-4 mb-8">
                        <SidebarTrigger>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SidebarTrigger>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {activeTab === 'users' && 'User Management'}
                                {activeTab === 'providers' && 'Provider Management'}
                                {activeTab === 'settings' && 'Platform Settings'}
                            </h1>
                            <p className="text-muted-foreground">
                                {activeTab === 'users' && 'View and manage all platform users'}
                                {activeTab === 'providers' && 'View and manage service providers'}
                                {activeTab === 'settings' && 'Configure platform settings'}
                            </p>
                        </div>
                    </header>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{users.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Providers</CardTitle>
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {users.filter(u => u.role === 'provider').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                                <Shield className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {users.filter(u => u.role === 'admin').length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content based on active tab */}
                    {(activeTab === 'users' || activeTab === 'providers') && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {activeTab === 'users' ? 'All Users' : 'Service Providers'}
                                </CardTitle>
                                <CardDescription>
                                    {activeTab === 'users'
                                        ? 'Manage user accounts and their roles'
                                        : 'View and manage registered service providers'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingData ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No {activeTab === 'providers' ? 'providers' : 'users'} found.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>User ID</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.map((u) => (
                                                <TableRow key={u.id}>
                                                    <TableCell className="font-medium">
                                                        {u.full_name || 'Unnamed User'}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {u.user_id.slice(0, 8)}...
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                u.role === 'admin'
                                                                    ? 'default'
                                                                    : u.role === 'provider'
                                                                        ? 'secondary'
                                                                        : 'outline'
                                                            }
                                                        >
                                                            {u.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={u.role}
                                                            onValueChange={(value) => updateUserRole(u.user_id, value as AppRole)}
                                                            disabled={updatingRole === u.user_id}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="user">User</SelectItem>
                                                                <SelectItem value="provider">Provider</SelectItem>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'settings' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Settings</CardTitle>
                                <CardDescription>
                                    Configure global platform settings and preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12 text-muted-foreground">
                                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Platform settings coming soon.</p>
                                    <p className="text-sm mt-2">
                                        This section will include booking rules, payment settings, and more.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </SidebarProvider>
    );
}
