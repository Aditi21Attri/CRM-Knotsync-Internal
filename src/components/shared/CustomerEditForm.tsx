
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
import type { Customer } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const customerEditFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phoneNumber: z.string().min(5, { message: "Phone number seems too short." }).optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
});

type CustomerEditFormValues = z.infer<typeof customerEditFormSchema>;

interface CustomerEditFormProps {
  customer: Customer;
  onFormSubmit: () => void;
}

export function CustomerEditForm({ customer, onFormSubmit }: CustomerEditFormProps) {
  const { updateCustomer } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CustomerEditFormValues>({
    resolver: zodResolver(customerEditFormSchema),
    defaultValues: {
      name: customer.name || "",
      email: customer.email || "",
      phoneNumber: customer.phoneNumber || "",
      category: customer.category || "",
    },
  });

  async function onSubmit(data: CustomerEditFormValues) {
    setIsSubmitting(true);
    const updatedData: Partial<Customer> = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        category: data.category,
    };
    await updateCustomer(customer.id, updatedData);
    setIsSubmitting(false);
    form.reset(); // Reset form to new default values if needed, or clear
    onFormSubmit(); // Close dialog
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-headline">Edit Customer: {customer.name}</DialogTitle>
          <DialogDescription>
            Update the details for this customer. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 px-6 py-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
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
                <FormLabel>Email Address</FormLabel>
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
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 555-123-4567" {...field} />
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
                <FormLabel>Category/Region (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. USA, Tech, Enterprise" {...field} />
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
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
