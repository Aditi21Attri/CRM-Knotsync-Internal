"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { verifyTokenForPasswordReset, resetPassword } from '@/lib/actions/userActions';
import { KeyRound, Loader2, ShieldCheck, AlertTriangle, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = typeof params.token === 'string' ? params.token : '';
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setVerificationMessage("No reset token provided.");
      return;
    }

    const verifyToken = async () => {
      setIsLoading(true);
      try {
        const result = await verifyTokenForPasswordReset(token);
        if (result.isValid) {
          setIsTokenValid(true);
          setUserEmail(result.email || null);
        } else {
          setIsTokenValid(false);
          setVerificationMessage(result.message || "Invalid or expired token.");
        }
      } catch (error) {
        setIsTokenValid(false);
        setVerificationMessage("Error verifying token. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token || !isTokenValid) return;
    setIsLoading(true);
    try {
      const result = await resetPassword(token, data.newPassword);
      if (result.success) {
        toast({
          title: "Password Reset Successful",
          description: result.message,
        });
        setResetSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        setVerificationMessage(result.message);
        setIsTokenValid(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying reset token...</p>
        </motion.div>
      </div>
    );
  }

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
              {resetSuccess ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : isTokenValid === false ? (
                <AlertTriangle className="h-8 w-8 text-destructive" />
              ) : (
                <KeyRound className="h-8 w-8 text-primary" />
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {resetSuccess ? "Password Reset!" : isTokenValid === false ? "Invalid Link" : "Reset Your Password"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {resetSuccess 
                  ? "Your password has been successfully updated. Redirecting to login..."
                  : isTokenValid === false 
                    ? verificationMessage || "This password reset link is invalid or has expired."
                    : `Enter a new password for ${userEmail || 'your account'}.`
                }
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <AnimatePresence mode="wait">
            {resetSuccess ? (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6"
              >
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Redirecting you to the login page...
                    </p>
                  </div>
                  <motion.div
                    className="w-full bg-border/20 rounded-full h-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ) : isTokenValid === true ? (
              <motion.div
                key="form-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="newPassword" className="flex items-center font-medium">
                                <KeyRound className="mr-2 h-4 w-4 text-primary" />
                                New Password
                              </Label>
                              <FormControl>
                                <Input 
                                  id="newPassword" 
                                  type="password" 
                                  placeholder="Enter your new password" 
                                  {...field} 
                                  disabled={isLoading} 
                                  className="glassmorphism border-border/50 focus:border-primary/50 transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="confirmPassword" className="flex items-center font-medium">
                                <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                                Confirm New Password
                              </Label>
                              <FormControl>
                                <Input 
                                  id="confirmPassword" 
                                  type="password" 
                                  placeholder="Confirm your new password" 
                                  {...field} 
                                  disabled={isLoading} 
                                  className="glassmorphism border-border/50 focus:border-primary/50 transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="w-full"
                      >
                        <Button 
                          type="submit" 
                          className="w-full text-lg py-6 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <ShieldCheck className="mr-2 h-5 w-5" />
                          )}
                          Reset Password
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </form>
                </Form>
              </motion.div>
            ) : (
              <motion.div
                key="error-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardFooter className="flex-col gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="w-full space-y-4"
                  >
                    <Button variant="outline" asChild className="w-full glassmorphism border-border/50">
                      <Link href="/forgot-password">
                        Request a New Reset Link
                      </Link>
                    </Button>
                    <Button variant="link" asChild className="text-primary hover:underline">
                      <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                      </Link>
                    </Button>
                  </motion.div>
                </CardFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
