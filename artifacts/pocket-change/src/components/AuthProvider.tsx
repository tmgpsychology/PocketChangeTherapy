import React, { createContext, useContext } from "react";
import { useGetAuthUser } from "@workspace/api-client-react";
import type { GetAuthUserResponse } from "@workspace/api-client-react/src/generated/api.schemas";

interface AuthContextType {
  user: GetAuthUserResponse | null;
  isLoading: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true, refetch: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, refetch } = useGetAuthUser({
    query: {
      retry: false,
    },
  });

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
