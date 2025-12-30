import { useAuth } from "@/context/AuthContext";

export const useUserRole = () => {
    const { user } = useAuth();

    // Logic to determine if user is admin. Adjust based on actual user object structure.
    // Common patterns: user.role, user.user_metadata.role, or user.app_metadata.role
    const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';
    const isProvider = user?.role === 'provider' || user?.user_metadata?.role === 'provider';

    return {
        isAdmin,
        isProvider,
        role: user?.role || user?.user_metadata?.role || 'customer'
    };
};
