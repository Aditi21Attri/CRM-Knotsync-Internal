"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Loader2, UserPlus, ShieldAlert, User, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="absolute inset-0">
          {/* Floating orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <Card className="glassmorphism border border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mx-auto"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to access your CRM dashboard and manage your customer relationships.
              </CardDescription>
            </motion.div>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="flex items-center font-medium">
                  <User className="mr-2 h-4 w-4 text-primary" />
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="e.g. admin@crm.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="glassmorphism border-border/50 focus:border-primary/50 transition-colors"
                  required 
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center font-medium">
                    <Lock className="mr-2 h-4 w-4 text-primary" />
                    Password
                  </Label>
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
                  className="glassmorphism border-border/50 focus:border-primary/50 transition-colors"
                  required 
                />
              </motion.div>
            </CardContent>

            <CardFooter>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="w-full"
              >
                <Button 
                  type="submit" 
                  className="w-full text-lg py-6 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300" 
                  disabled={isSubmittingLogin}
                >
                  {isSubmittingLogin ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-5 w-5" />
                  )}
                  Sign In
                </Button>
              </motion.div>
            </CardFooter>
          </form>

          <Separator className="my-6" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="px-6 pb-6"
          >
            <AnimatePresence mode="wait">
              {!showCreateAdminForm ? (
                <motion.div
                  key="show-form-button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    variant="outline" 
                    className="w-full glassmorphism border-border/50 hover:bg-primary/10" 
                    onClick={() => setShowCreateAdminForm(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Initial Admin Account
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="admin-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleCreateAdmin}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-center text-primary flex items-center justify-center">
                    <ShieldAlert className="mr-2 h-5 w-5" />
                    Create Initial Admin
                  </h3>
                  <p className="text-xs text-center text-muted-foreground mb-3">
                    Use this only for the first admin setup. This option may be disabled if an admin already exists.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="adminName">Full Name</Label>
                    <Input 
                      id="adminName" 
                      placeholder="Admin Full Name" 
                      value={adminName} 
                      onChange={(e) => setAdminName(e.target.value)} 
                      className="glassmorphism border-border/50"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email Address</Label>
                    <Input 
                      id="adminEmail" 
                      type="email" 
                      placeholder="admin.user@example.com" 
                      value={adminEmail} 
                      onChange={(e) => setAdminEmail(e.target.value)} 
                      className="glassmorphism border-border/50"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input 
                      id="adminPassword" 
                      type="password" 
                      placeholder="Enter password" 
                      value={adminPassword} 
                      onChange={(e) => setAdminPassword(e.target.value)} 
                      className="glassmorphism border-border/50"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminConfirmPassword">Confirm Password</Label>
                    <Input 
                      id="adminConfirmPassword" 
                      type="password" 
                      placeholder="Confirm password" 
                      value={adminConfirmPassword} 
                      onChange={(e) => setAdminConfirmPassword(e.target.value)} 
                      className="glassmorphism border-border/50"
                      required 
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button 
                      type="submit" 
                      className="w-full sm:flex-1 bg-gradient-to-r from-primary to-accent" 
                      disabled={isSubmittingAdminCreate}
                    >
                      {isSubmittingAdminCreate ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-5 w-5" />
                      )}
                      Create Admin
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="w-full sm:w-auto" 
                      onClick={() => setShowCreateAdminForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
