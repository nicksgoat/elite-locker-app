/**
 * Elite Locker - Authentication Context
 * 
 * This file contains the authentication context provider
 * for managing authentication state across the app.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthUser } from '../hooks/useAuth';

// Context type
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: any;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, username: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (profile: {
    username?: string;
    avatarUrl?: string;
    fullName?: string;
    bio?: string;
  }) => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => false,
  resetPassword: async () => false,
  updateProfile: async () => false,
});

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication context provider
 * @param props Provider props
 * @returns Provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook for using the authentication context
 * @returns Authentication context
 */
export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
