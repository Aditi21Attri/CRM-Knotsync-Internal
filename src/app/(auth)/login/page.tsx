
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    login(selectedRole);
  };

  if (isLoading) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="p-4">Loading authentication status...</div>
        </div>
      );
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Welcome to Stratagem CRM</CardTitle>
          <CardDescription className="text-muted-foreground">Select your role to sign in</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <RadioGroup
              defaultValue="employee"
              onValueChange={(value: string) => setSelectedRole(value as UserRole)}
              className="space-y-2"
              aria-label="Select user role"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="admin" id="role-admin" />
                <Label htmlFor="role-admin" className="text-lg cursor-pointer flex-1">Administrator</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="employee" id="role-employee" />
                <Label htmlFor="role-employee" className="text-lg cursor-pointer flex-1">Employee</Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              <LogIn className="mr-2 h-5 w-5" /> Sign In as {selectedRole === 'admin' ? 'Admin' : 'Employee'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
