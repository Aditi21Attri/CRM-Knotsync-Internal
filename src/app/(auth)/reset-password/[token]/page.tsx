
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
import { KeyRound, Loader2, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // Point error to confirmPassword field
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
        router.push('/login');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        setVerificationMessage(result.message); // Update message if token became invalid during submission
        setIsTokenValid(false); // Mark token as invalid on error
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

  if (isLoading && isTokenValid === null) { // Initial token verification loading
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-block p-3 rounded-full bg-primary/10 mb-4 mx-auto">
            {isTokenValid === false ? <AlertTriangle className="h-8 w-8 text-destructive" /> : <KeyRound className="h-8 w-8 text-primary" />}
          </div>
          <CardTitle className="text-3xl font-headline text-primary">
            {isTokenValid === false ? "Invalid Link" : "Reset Your Password"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isTokenValid === false 
              ? verificationMessage || "This password reset link is invalid or has expired."
              : `Enter a new password for ${userEmail || 'your account'}.`
            }
          </CardDescription>
        </CardHeader>
        
        {isTokenValid === true && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="newPassword">New Password</Label>
                      <FormControl>
                        <Input id="newPassword" type="password" placeholder="Enter your new password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <FormControl>
                        <Input id="confirmPassword" type="password" placeholder="Confirm your new password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                  Reset Password
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}

        {isTokenValid === false && (
            <CardFooter className="flex-col gap-4">
                 <Button variant="outline" asChild className="w-full">
                    <Link href="/forgot-password">
                        Request a New Reset Link
                    </Link>
                </Button>
                <Button variant="link" asChild className="text-primary hover:underline">
                    <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Link>
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
