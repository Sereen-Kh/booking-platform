import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

interface AuthContextType {
  user: null;
  session: null;
  loading: boolean;
  signUp: (...args: any[]) => Promise<{ error: Error | null }>;
  signIn: (...args: any[]) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Placeholder auth context for non-supabase usage
  const signUp = async () => ({ error: new Error("Auth not implemented") });
  const signIn = async () => ({ error: new Error("Auth not implemented") });
  const signOut = async () => {};
  return (
    <AuthContext.Provider
      value={{
        user: null,
        session: null,
        loading: false,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
