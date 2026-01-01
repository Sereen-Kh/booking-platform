import { useAuth } from "@/context/AuthContext";

export type AppRole = 'admin' | 'provider' | 'user' | 'customer';

export const useUserRole = () => {
    const { user } = useAuth();

    // Logic to determine if user is admin. Adjust based on actual user object structure.
    const role = (user?.role || user?.user_metadata?.role || 'customer') as AppRole;

    const isAdmin = role === 'admin';
    const isProvider = role === 'provider';

    return {
        isAdmin,
        isProvider,
        role
    };
};
