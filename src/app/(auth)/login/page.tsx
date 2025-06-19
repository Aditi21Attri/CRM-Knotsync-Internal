
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Loader2, UserPlus, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);

  const { login, createInitialAdmin, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingAdminCreate, setIsSubmittingAdminCreate] = useState(false);


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
        toast({
            title: "Missing Information",
            description: "Please enter both email and password.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmittingLogin(true);
    await login(email, password);
    setIsSubmittingLogin(false);
  };

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adminName || !adminEmail || !adminPassword || !adminConfirmPassword) {
      toast({ title: "Missing Fields", description: "Please fill all fields for admin creation.", variant: "destructive" });
      return;
    }
    if (adminPassword !== adminConfirmPassword) {
      toast({ title: "Passwords Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setIsSubmittingAdminCreate(true);
    await createInitialAdmin(adminName, adminEmail, adminPassword);
    setIsSubmittingAdminCreate(false);
    // Optionally clear form or hide it after attempt
    // setShowCreateAdminForm(false); 
    // setAdminName(''); setAdminEmail(''); setAdminPassword(''); setAdminConfirmPassword('');
  };

  if (authIsLoading && !isSubmittingLogin && !isSubmittingAdminCreate) { 
     return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Checking authentication status...</p>
          </div>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-block p-3 rounded-full bg-primary/10 mb-4 mx-auto">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Welcome to Stratagem CRM</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to your account or create an initial admin.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="e.g. admin@crm.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  type="button"
                  variant="link" 
                  asChild
                  className="px-0 text-xs h-auto text-primary hover:underline"
                >
                  <Link href="/forgot-password">Forgot Password?</Link>
                </Button>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmittingLogin}>
              {isSubmittingLogin ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              Sign In
            </Button>
          </CardFooter>
        </form>

        <Separator className="my-6" />

        <div className="px-6 pb-6">
          {!showCreateAdminForm ? (
            <Button variant="outline" className="w-full" onClick={() => setShowCreateAdminForm(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Create Initial Admin Account
            </Button>
          ) : (
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <h3 className="text-lg font-semibold text-center text-primary flex items-center justify-center">
                <ShieldAlert className="mr-2 h-5 w-5" /> Create Initial Admin
              </h3>
               <p className="text-xs text-center text-muted-foreground mb-3">
                Use this only for the first admin setup. This option may be disabled if an admin already exists.
              </p>
              <div className="space-y-2">
                <Label htmlFor="adminName">Full Name</Label>
                <Input id="adminName" placeholder="Admin Full Name" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address</Label>
                <Input id="adminEmail" type="email" placeholder="admin.user@example.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input id="adminPassword" type="password" placeholder="Enter password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminConfirmPassword">Confirm Password</Label>
                <Input id="adminConfirmPassword" type="password" placeholder="Confirm password" value={adminConfirmPassword} onChange={(e) => setAdminConfirmPassword(e.target.value)} required />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button type="submit" className="w-full sm:flex-1" disabled={isSubmittingAdminCreate}>
                  {isSubmittingAdminCreate ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                  Create Admin
                </Button>
                <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setShowCreateAdminForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
