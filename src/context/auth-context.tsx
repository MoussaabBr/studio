
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // usePathname
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from '@/services/user-service'; // Using UserProfile from service
import LoadingPage from "@/components/loading-page";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);


  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data); // data should be the user profile
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.username}!`,
        });
        router.push("/dashboard");
        setIsLoading(false);
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid email or password.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred during login.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading page only if actively loading, not on initial undefined state for public pages.
  // And ensure pathname is available.
  if (isLoading && pathname && (pathname.startsWith('/dashboard') || pathname === '/')) {
    return <LoadingPage />;
  }


  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
