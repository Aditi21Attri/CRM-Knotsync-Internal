
"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; // Added useToast

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>; // Updated signature
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        const validUser = mockUsers.find(u => u.id === parsedUser.id && u.email === parsedUser.email);
        if (validUser) {
          setCurrentUser(validUser);
        } else {
          localStorage.removeItem('currentUser');
        }
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem('currentUser');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const adminUser = mockUsers.find(
      (user) => user.email.toLowerCase() === 'admin@crm.com' && user.role === 'admin'
    );

    if (adminUser && email.toLowerCase() === 'admin@crm.com' && password === 'Pass123') {
      setCurrentUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      router.push('/dashboard');
      toast({ title: "Login Successful", description: `Welcome back, ${adminUser.name}!` });
    } else {
      // Optional: Allow other mock users to login if their email matches, for testing other roles.
      // This part can be removed if only admin login is desired.
      const otherUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== adminUser?.id);
      if (otherUser && password) { // Simplified check: if email matches and password is not empty
        setCurrentUser(otherUser);
        localStorage.setItem('currentUser', JSON.stringify(otherUser));
        router.push('/dashboard');
        toast({ title: "Login Successful", description: `Welcome, ${otherUser.name}!`});
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      }
    }
    setIsLoading(false);
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
