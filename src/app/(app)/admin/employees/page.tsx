
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmployeeForm } from "@/components/admin/EmployeeForm";
import { useData } from "@/contexts/DataContext";
import type { User } from "@/lib/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function ManageEmployeesPage() {
  const { users, employees, dataLoading } = useData(); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | undefined>(undefined);

  const handleAddEmployee = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: User) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteEmployee = (employee: User) => {
    // Placeholder for delete functionality
    // Consider adding a confirmation dialog here
    alert(`Delete functionality for ${employee.name} is not yet implemented.`);
  };
  
  const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading employee data..." /></div>;
  }

  const dialogContent = editingEmployee 
    ? <EmployeeForm employee={editingEmployee} onFormSubmit={() => { setIsFormOpen(false); setEditingEmployee(undefined); }} />
    : <EmployeeForm onFormSubmit={() => setIsFormOpen(false)} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Employees"
        description="View, add, or modify employee accounts and roles."
        actions={
          <Button onClick={handleAddEmployee}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
          </Button>
        }
      />
      
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setEditingEmployee(undefined); // Clear editing state when dialog closes
          }
        }}>
        <DialogContent className="sm:max-w-[525px] p-0">
          {/* Conditionally render form based on editingEmployee state */}
          {isFormOpen && (editingEmployee 
            ? <EmployeeForm employee={editingEmployee} onFormSubmit={() => { setIsFormOpen(false); setEditingEmployee(undefined); }} />
            : <EmployeeForm onFormSubmit={() => setIsFormOpen(false)} />
          )}
        </DialogContent>
      </Dialog>


      {employees.length === 0 && !editingEmployee ? ( // Prevent flash of "No Employees" when form is open for add
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">No Employees Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first employee.
          </p>
           <Button className="mt-4" onClick={handleAddEmployee}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.avatarUrl || `https://placehold.co/40x40/E5EAF7/2962FF?text=${getInitials(employee.name)}`} alt={employee.name} data-ai-hint="employee avatar" />
                      <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee)} aria-label="Edit employee">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteEmployee(employee)} aria-label="Delete employee">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
