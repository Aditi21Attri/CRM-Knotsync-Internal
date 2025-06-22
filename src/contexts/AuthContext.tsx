
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { authenticateUserAPIAPI, createInitialAdminAPI } from '@/lib/api-client';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  createInitialAdmin: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        if (parsedUser && parsedUser.status === 'active') {
            setCurrentUser(parsedUser);
        } else if (parsedUser && parsedUser.status === 'suspended') {
            localStorage.removeItem('currentUser'); 
             toast({
                title: 'Account Suspended',
                description: 'Your account is currently suspended. Please contact an administrator.',
                variant: 'destructive',
            });
        } else {
             localStorage.removeItem('currentUser');
        }
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem('currentUser');
    }
    setIsLoading(false);
  }, [toast]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authenticateUserAPI(email, password);

      if (user && user.status === 'active') {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        router.push('/dashboard');
        toast({ title: "Login Successful", description: `Welcome back, ${user.name}!` });
      } else if (user && user.status === 'suspended') {
         toast({
          title: 'Account Suspended',
          description: 'Your account is currently suspended. Please contact an administrator.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password, or account may be inactive/suspended. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred during login.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  const createInitialAdmin = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await createInitialAdminAPI({ name, email, password });
      if (result.success && result.user) {
        toast({
          title: "Admin Account Created",
          description: `Admin ${result.user.name} created. Please log in.`,
        });
        // router.push('/login'); // Or automatically log them in
      } else {
        toast({
          title: "Admin Creation Failed",
          description: result.message || "Could not create admin account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create admin error:", error);
      toast({
        title: 'Creation Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading, createInitialAdmin }}>
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
