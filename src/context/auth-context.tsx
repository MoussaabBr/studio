
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { getUserProfile, createUserProfile, UserProfile } from '@/services/user-service';
import LoadingPage from "@/components/loading-page";

interface User extends UserProfile {} // Using UserProfile from service

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        let userProfile = await getUserProfile(firebaseUser.uid);
        if (!userProfile) {
          // If profile doesn't exist, create it
          // For username, we could use email prefix or a default.
          // Or, prompt user to set a username after first login.
          // For now, let's use a simple default based on email.
          userProfile = await createUserProfile(firebaseUser);
        }
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      let userProfile = await getUserProfile(firebaseUser.uid);
      if (!userProfile) {
        userProfile = await createUserProfile(firebaseUser);
      }
      setUser(userProfile);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userProfile.username}!`,
      });
      setIsLoading(false);
      router.push("/dashboard"); // Redirect after state is set
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Invalid email or password.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else {
        errorMessage = "An unexpected error occurred during login. Please try again.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
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
  
  if (isLoading && !user && (router.pathname === '/login' || router.pathname === '/dashboard')) {
     // Avoid showing loading page if already on a public page and not yet determined auth state for initial load
  } else if (isLoading) {
    return <LoadingPage />;
  }


  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
