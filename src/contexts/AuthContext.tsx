
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { authenticateUser } from '@/lib/actions/userActions'; 

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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
        // Re-validate session by checking status, but not re-authenticating password from localStorage
        if (parsedUser && parsedUser.status === 'active') {
            setCurrentUser(parsedUser);
        } else if (parsedUser && parsedUser.status === 'suspended') {
            localStorage.removeItem('currentUser'); // Clear suspended user from storage
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
  }, [toast]); // Added toast to dependency array

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authenticateUser(email, password);

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
          description: 'Invalid email or password, or account may be inactive. Please try again.',
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

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
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
