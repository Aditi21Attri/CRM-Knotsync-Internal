
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription as FormDialogDescription, DialogClose } from "@/components/ui/dialog"; // Renamed DialogDescription to avoid conflict
import { useData } from "@/contexts/DataContext";
import type { User, UserRole } from "@/lib/types";

const employeeFormSchemaBase = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  role: z.enum(['admin', 'employee'], { required_error: "Role is required." }),
  specializedRegion: z.string().optional().describe("The region the employee specializes in, e.g., USA, UK."),
});

// Schema for adding an employee (password is required)
const addEmployeeFormSchema = employeeFormSchemaBase.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// Schema for editing an employee (password is optional or not included)
const editEmployeeFormSchema = employeeFormSchemaBase;


interface EmployeeFormProps {
  employee?: User; // Optional: for editing an existing employee
  onFormSubmit?: () => void; // Optional: callback after successful submission
}

export function EmployeeForm({ employee, onFormSubmit }: EmployeeFormProps) {
  const { addEmployee, updateEmployee } = useData();
  
  const currentFormSchema = employee ? editEmployeeFormSchema : addEmployeeFormSchema;
  type EmployeeFormValues = z.infer<typeof currentFormSchema>;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      name: employee?.name || "",
      email: employee?.email || "",
      role: employee?.role || "employee",
      specializedRegion: employee?.specializedRegion || "",
      ...(currentFormSchema === addEmployeeFormSchema && { password: "" }),
    },
  });

  function onSubmit(data: EmployeeFormValues) {
    if (employee) {
      const { ...editData } = data as z.infer<typeof editEmployeeFormSchema>;
      updateEmployee(employee.id, editData);
    } else {
      addEmployee(data as z.infer<typeof addEmployeeFormSchema>);
    }
    form.reset();
    onFormSubmit?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle className="font-headline">{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <FormDialogDescription>
            {employee ? "Update the details, role, and specialized region of the employee." : "Enter details, assign role, set password, and optionally a specialized region."}
          </FormDialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 px-6 py-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
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
          {!employee && ( 
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password (min 6 characters)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specializedRegion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialized Region (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., USA, UK, Australia" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>
                  If this employee handles customers from a specific region/country, enter it here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <DialogClose asChild>
             <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
          <Button type="submit">{employee ? "Save Changes" : "Create Employee"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
