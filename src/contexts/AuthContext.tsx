
"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers } from '@/lib/mockData';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for a logged-in user from localStorage or a session
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        // Validate if user exists in mockUsers for this demo
        const validUser = mockUsers.find(u => u.id === parsedUser.id && u.role === parsedUser.role);
        if (validUser) {
          setCurrentUser(validUser);
        } else {
          localStorage.removeItem('currentUser'); // Clear invalid stored user
        }
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem('currentUser');
    }
    setIsLoading(false);
  }, []);

  const login = (role: UserRole) => {
    // For demo, pick the first user with the selected role
    const userToLogin = mockUsers.find(user => user.role === role);
    if (userToLogin) {
      setCurrentUser(userToLogin);
      localStorage.setItem('currentUser', JSON.stringify(userToLogin));
      router.push('/dashboard');
    } else {
      // Handle case where no user of that role exists (e.g., show an error)
      console.error(`No mock user found for role: ${role}`);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
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
