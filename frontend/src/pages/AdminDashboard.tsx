import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Briefcase,
  Settings,
  Shield,
  Menu,
  Home,
  Loader2,
  UserCheck,
  UserX,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Package,
  Activity,
  Star,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { adminAPI } from "@/utils/api";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

type Tab =
  | "overview"
  | "users"
  | "providers"
  | "bookings"
  | "analytics"
  | "settings";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
}

interface Booking {
  id: number;
  service_id: number;
  customer_id: number;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  service?: {
    id: number;
    name: string;
    price: number;
  };
  customer?: {
    id: number;
    email: string;
    full_name?: string;
  };
  provider?: {
    id: number;
    email: string;
    full_name?: string;
  };
}

interface Service {
  id: number;
  name: string;
  category_id: number;
  price: number;
  booking_count?: number;
}

const menuItems = [
  { title: "Overview", value: "overview" as Tab, icon: BarChart3 },
  { title: "Users", value: "users" as Tab, icon: Users },
  { title: "Providers", value: "providers" as Tab, icon: Briefcase },
  { title: "Bookings", value: "bookings" as Tab, icon: Calendar },
  { title: "Analytics", value: "analytics" as Tab, icon: TrendingUp },
  { title: "Settings", value: "settings" as Tab, icon: Settings },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, isAdmin, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([fetchUsers(), fetchBookings(), fetchServices()]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      const mappedUsers: UserWithRole[] = Array.isArray(data)
        ? data.map((u: any) => ({
            id: u.id,
            user_id: u.id,
            full_name: u.full_name,
            email: u.email,
            avatar_url: u.avatar_url || null,
            role: u.role as AppRole,
            created_at: u.created_at || new Date().toISOString(),
          }))
        : [];
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
      setUsers([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings/all");
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get("/services");
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    setUpdatingRole(userId);
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast({
        title: "Role Updated",
        description: `User role has been changed to ${newRole}.`,
      });
      await fetchUsers();
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: any;
      }
    > = {
      pending: { variant: "secondary", icon: Clock },
      confirmed: { variant: "default", icon: CheckCircle },
      completed: { variant: "outline", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
    };
    const config = statusConfig[status.toLowerCase()] || {
      variant: "secondary" as const,
      icon: AlertCircle,
    };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Analytics calculations
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled"
  ).length;

  const totalRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.service?.price || 0), 0);

  const cancellationRate =
    totalBookings > 0
      ? ((cancelledBookings / totalBookings) * 100).toFixed(1)
      : "0.0";

  const filteredUsers =
    activeTab === "providers"
      ? users.filter((u) => u.role === "provider")
      : users;

  if (authLoading) {
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
                        className={
                          activeTab === item.value
                            ? "bg-primary/10 text-primary"
                            : ""
                        }
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
                    <SidebarMenuButton onClick={() => navigate("/")}>
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
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SidebarTrigger>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {activeTab === "overview" && "Platform Overview"}
                  {activeTab === "users" && "User Management"}
                  {activeTab === "providers" && "Provider Management"}
                  {activeTab === "bookings" && "Booking Management"}
                  {activeTab === "analytics" && "Analytics & Insights"}
                  {activeTab === "settings" && "Platform Settings"}
                </h1>
                <p className="text-muted-foreground">
                  {activeTab === "overview" &&
                    "Monitor platform health and key metrics"}
                  {activeTab === "users" &&
                    "View and manage all platform users"}
                  {activeTab === "providers" &&
                    "View and manage service providers"}
                  {activeTab === "bookings" &&
                    "Monitor all bookings and service delivery"}
                  {activeTab === "analytics" && "Track KPIs and growth metrics"}
                  {activeTab === "settings" && "Configure platform settings"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAllData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </header>

          {/* Stats Cards - Show on Overview */}
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <DollarSign className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${totalRevenue.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From {completedBookings} completed bookings
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Bookings
                    </CardTitle>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {pendingBookings} pending approval
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Providers
                    </CardTitle>
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {users.filter((u) => u.role === "provider").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {services.length} services listed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cancellation Rate
                    </CardTitle>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cancellationRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cancelledBookings} of {totalBookings} bookings
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Health */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Status Distribution</CardTitle>
                    <CardDescription>
                      Current state of all bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Pending</span>
                      </div>
                      <span className="font-semibold">{pendingBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Confirmed</span>
                      </div>
                      <span className="font-semibold">{confirmedBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Completed</span>
                      </div>
                      <span className="font-semibold">{completedBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Cancelled</span>
                      </div>
                      <span className="font-semibold">{cancelledBookings}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Platform user breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Total Users</span>
                      </div>
                      <span className="font-semibold">{users.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span className="text-sm">Providers</span>
                      </div>
                      <span className="font-semibold">
                        {users.filter((u) => u.role === "provider").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Customers</span>
                      </div>
                      <span className="font-semibold">
                        {users.filter((u) => u.role === "user").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm">Admins</span>
                      </div>
                      <span className="font-semibold">
                        {users.filter((u) => u.role === "admin").length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Bookings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest booking activity</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("bookings")}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {bookings.slice(0, 5).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No bookings yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {booking.service?.name || "Service"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.start_time)} • #{booking.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-primary">
                              ${booking.service?.price?.toFixed(2) || "0.00"}
                            </span>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Stats Cards - Show on Users/Providers tabs */}
          {(activeTab === "users" || activeTab === "providers") && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Providers
                  </CardTitle>
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter((u) => u.role === "provider").length}
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
                    {users.filter((u) => u.role === "admin").length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content based on active tab */}
          {(activeTab === "users" || activeTab === "providers") && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "users" ? "All Users" : "Service Providers"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "users"
                    ? "Manage user accounts and their roles"
                    : "View and manage registered service providers"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {activeTab === "providers" ? "providers" : "users"}{" "}
                    found.
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
                            {u.full_name || "Unnamed User"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {u.user_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.role === "admin"
                                  ? "default"
                                  : u.role === "provider"
                                  ? "secondary"
                                  : "outline"
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
                              onValueChange={(value) =>
                                updateUserRole(u.user_id, value as AppRole)
                              }
                              disabled={updatingRole === u.user_id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="provider">
                                  Provider
                                </SelectItem>
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
          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  Monitor all bookings and service delivery across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">
                            #{booking.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {booking.service?.name || "N/A"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {booking.customer?.full_name ||
                              booking.customer?.email ||
                              "N/A"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {booking.provider?.full_name ||
                              booking.provider?.email ||
                              "N/A"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(booking.start_time)}
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            ${booking.service?.price?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg Booking Value
                    </CardTitle>
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      $
                      {completedBookings > 0
                        ? (totalRevenue / completedBookings).toFixed(2)
                        : "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per completed booking
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completion Rate
                    </CardTitle>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalBookings > 0
                        ? ((completedBookings / totalBookings) * 100).toFixed(1)
                        : "0"}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {completedBookings} of {totalBookings} completed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Services
                    </CardTitle>
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{services.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Listed on platform
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quality Control Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Control Metrics</CardTitle>
                  <CardDescription>
                    Monitor platform health and service quality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Cancellation Rate</p>
                      <p className="text-sm text-muted-foreground">
                        Lower is better - Target: {"<"}10%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{cancellationRate}%</p>
                      <Badge
                        variant={
                          parseFloat(cancellationRate) < 10
                            ? "default"
                            : "destructive"
                        }
                      >
                        {parseFloat(cancellationRate) < 10
                          ? "Good"
                          : "Needs Attention"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Provider-to-Customer Ratio</p>
                      <p className="text-sm text-muted-foreground">
                        Balance of supply and demand
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        1:
                        {users.filter((u) => u.role === "provider").length > 0
                          ? Math.round(
                              users.filter((u) => u.role === "user").length /
                                users.filter((u) => u.role === "provider")
                                  .length
                            )
                          : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Customers per provider
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Pending Approval Time</p>
                      <p className="text-sm text-muted-foreground">
                        {pendingBookings} bookings awaiting confirmation
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          pendingBookings > 10 ? "destructive" : "secondary"
                        }
                      >
                        {pendingBookings > 10 ? "High" : "Normal"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strategic Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Insights</CardTitle>
                  <CardDescription>
                    Data-driven recommendations for growth
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.filter((u) => u.role === "provider").length < 5 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-orange-500">
                          Grow Provider Base
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Only{" "}
                          {users.filter((u) => u.role === "provider").length}{" "}
                          active providers. Consider onboarding campaigns.
                        </p>
                      </div>
                    </div>
                  )}
                  {parseFloat(cancellationRate) > 15 && (
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-500">
                          High Cancellation Rate
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Review booking policies and provider quality. Rate is{" "}
                          {cancellationRate}%.
                        </p>
                      </div>
                    </div>
                  )}
                  {completedBookings > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-500">
                          Platform Activity
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {completedBookings} completed bookings generating $
                          {totalRevenue.toFixed(2)} in revenue.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {activeTab === "settings" && (
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
                    This section will include booking rules, payment settings,
                    and more.
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
