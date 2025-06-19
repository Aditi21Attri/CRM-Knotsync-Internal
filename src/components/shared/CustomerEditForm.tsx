
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
import { useState, useMemo } from "react";

const customerCoreEditFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phoneNumber: z.string().min(5, { message: "Phone number seems too short." }).optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
}).passthrough(); 

type CustomerEditFormValues = z.infer<typeof customerCoreEditFormSchema> & {
  [key: string]: any; 
};

interface CustomerEditFormProps {
  customer: Customer;
  onFormSubmit: () => void;
}

const STANDARD_FIELDS = ['id', '_id', 'name', 'email', 'phoneNumber', 'category', 'status', 'assignedTo', 'notes', 'lastContacted'];

export function CustomerEditForm({ customer, onFormSubmit }: CustomerEditFormProps) {
  const { updateCustomer } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customFieldKeys = useMemo(() => {
    return Object.keys(customer).filter(key => !STANDARD_FIELDS.includes(key));
  }, [customer]);

  const form = useForm<CustomerEditFormValues>({
    resolver: zodResolver(customerCoreEditFormSchema), 
    defaultValues: {
      ...customer, 
      name: customer.name || "",
      email: customer.email || "",
      phoneNumber: customer.phoneNumber || "",
      category: customer.category || "",
    },
  });

  async function onSubmit(data: CustomerEditFormValues) {
    setIsSubmitting(true);
    await updateCustomer(customer.id, data as Partial<Customer>);
    setIsSubmitting(false);
    onFormSubmit(); 
  }

  const formatLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="font-headline text-xl">Edit Customer: {customer.name}</DialogTitle>
          <DialogDescription className="text-sm">
            Update the details for this customer. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 px-6 max-h-[calc(100vh-22rem)] overflow-y-auto pb-2">
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

          {customFieldKeys.length > 0 && (
            <div className="pt-4">
              <h4 className="text-md font-semibold mb-3 text-muted-foreground border-b pb-2">Additional Parameters</h4>
              {customFieldKeys.map(key => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>{formatLabel(key)}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                           value={field.value === null || field.value === undefined ? '' : String(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          )}
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
