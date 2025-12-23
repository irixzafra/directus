'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { directus, login as directusLogin, logout as directusLogout, getMe, DirectusUser } from '@/lib/directus';

interface AuthContextType {
  user: DirectusUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const token = directus.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      const me = await getMe();
      setUser(me as DirectusUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Try to get stored token and refresh
        const token = localStorage.getItem('directus_token');
        if (token) {
          // Set token and try to get user
          await directus.setToken(token);
          await refreshUser();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('directus_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await directusLogin(email, password);
      if (result.access_token) {
        localStorage.setItem('directus_token', result.access_token);
        if (result.refresh_token) {
          localStorage.setItem('directus_refresh_token', result.refresh_token);
        }
        await refreshUser();
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await directusLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('directus_token');
      localStorage.removeItem('directus_refresh_token');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
