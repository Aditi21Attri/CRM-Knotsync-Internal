
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import type { ManualAddCustomerFormData } from "@/lib/actions/customerActions";


const customerManualAddFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phoneNumber: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
});

type CustomerManualAddFormValues = z.infer<typeof customerManualAddFormSchema>;

interface CustomerManualAddFormProps {
  onFormSubmit: () => void;
}

export function CustomerManualAddForm({ onFormSubmit }: CustomerManualAddFormProps) {
  const { manualAddCustomer } = useData();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CustomerManualAddFormValues>({
    resolver: zodResolver(customerManualAddFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      category: "",
    },
  });

  async function onSubmit(data: CustomerManualAddFormValues) {
    if (!currentUser) {
        form.setError("root", { message: "User not authenticated." });
        return;
    }
    setIsSubmitting(true);
    const result = await manualAddCustomer(data as ManualAddCustomerFormData, currentUser.id, currentUser.role);
    setIsSubmitting(false);
    if (result.success) {
      form.reset();
      onFormSubmit();
    } else {
        // Error toast is handled by DataContext, but you could set form errors here if needed
        // form.setError("root", { message: "Failed to add customer. " + (result.message || "") });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="font-headline text-xl flex items-center"><UserPlus className="mr-2 h-6 w-6 text-primary"/>Add New Customer</DialogTitle>
          <DialogDescription className="text-sm">
            Enter the details for the new customer. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 px-6 max-h-[calc(100vh-22rem)] overflow-y-auto pb-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="e.g. John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="e.g. john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 555-123-4567" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category/Region</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. USA, Tech, Enterprise" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <DialogClose asChild>
             <Button variant="outline" type="button" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4"/>}
            Add Customer
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
