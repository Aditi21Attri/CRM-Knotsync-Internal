
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
import type { User } from "@/lib/types";

const employeeFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  employee?: User; // Optional: for editing an existing employee
  onFormSubmit?: () => void; // Optional: callback after successful submission
}

export function EmployeeForm({ employee, onFormSubmit }: EmployeeFormProps) {
  const { addEmployee } = useData(); // Assuming updateEmployee will be added for editing

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employee?.name || "",
      email: employee?.email || "",
    },
  });

  function onSubmit(data: EmployeeFormValues) {
    if (employee) {
      // Handle update logic here if implemented
      // updateEmployee({ ...employee, ...data });
      console.log("Update employee:", { ...employee, ...data });
    } else {
      addEmployee(data);
    }
    form.reset();
    onFormSubmit?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle className="font-headline">{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {employee ? "Update the details of the employee." : "Enter the details for the new employee."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 px-6 py-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Jane Doe" {...field} />
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
                  <Input type="email" placeholder="e.g. jane.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter className="px-6 pb-6">
          <DialogClose asChild>
             <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
          <Button type="submit">{employee ? "Save Changes" : "Create Employee"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
