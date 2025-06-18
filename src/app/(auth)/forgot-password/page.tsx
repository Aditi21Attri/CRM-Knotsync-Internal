
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { requestPasswordReset } from '@/lib/actions/userActions';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await requestPasswordReset(data.email);
      if (result.success) {
        toast({
          title: "Request Submitted",
          description: result.message,
        });
        setMessage(result.message); // Show message on page as well
        form.reset(); // Clear the form
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
           <div className="inline-block p-3 rounded-full bg-primary/10 mb-4 mx-auto">
             <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Forgot Your Password?</CardTitle>
          <CardDescription className="text-muted-foreground">
            No worries! Enter your email address below and we'll send you a link to reset your password. (For this prototype, the link will be logged to the server console.)
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email-forgot">Email Address</Label>
                    <FormControl>
                      <Input 
                        id="email-forgot" 
                        type="email" 
                        placeholder="e.g. user@example.com" 
                        {...field} 
                        disabled={isLoading || !!message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {message && <p className="text-sm text-center text-green-600 dark:text-green-400">{message}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || !!message}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
                Send Reset Link
              </Button>
              <Button variant="link" asChild className="text-primary hover:underline">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
