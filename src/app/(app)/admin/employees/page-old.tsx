
"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit2, Trash2, Ban, PlayCircle, AlertTriangle, Briefcase } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmployeeForm } from "@/components/admin/EmployeeForm";
import { useData } from "@/contexts/DataContext";
import type { User } from "@/lib/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

export default function ManageEmployeesPage() {
  const { employees, customers, dataLoading, deleteEmployee, toggleEmployeeSuspension } = useData(); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | undefined>(undefined);
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);

  const handleAddEmployee = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: User) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (employeeToDelete) {
      await deleteEmployee(employeeToDelete.id);
      setEmployeeToDelete(null);
    }
  };

  const handleToggleSuspension = async (employee: User) => {
    await toggleEmployeeSuspension(employee.id);
  };
  
  const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const getAssignedCustomersCount = (employeeId: string) => {
    return customers.filter(customer => customer.assignedTo === employeeId).length;
  };

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading employee data..." /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Employees"
        description="View, add, or modify employee accounts, roles, and status."
        actions={
          <Button onClick={handleAddEmployee}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
          </Button>
        }
      />
      
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setEditingEmployee(undefined); 
          }
        }}>
        <DialogContent className="sm:max-w-[525px] p-0">
          {isFormOpen && (editingEmployee 
            ? <EmployeeForm employee={editingEmployee} onFormSubmit={() => { setIsFormOpen(false); setEditingEmployee(undefined); }} />
            : <EmployeeForm onFormSubmit={() => setIsFormOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!employeeToDelete} onOpenChange={(isOpen) => !isOpen && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete employee {employeeToDelete?.name}? 
              This action cannot be undone. All customers currently assigned to this employee will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEmployee} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {employees.length === 0 && !editingEmployee ? ( 
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
                <TableHead>Assigned Customers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className={cn(employee.status === 'suspended' && 'opacity-60')}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.avatarUrl || `https://placehold.co/40x40/E5EAF7/2962FF?text=${getInitials(employee.name)}`} alt={employee.name} data-ai-hint="employee avatar" />
                      <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className={cn("font-medium", employee.status === 'suspended' && 'line-through')}>
                    {employee.name}
                    {employee.specializedRegion && <span className="ml-2 text-xs text-muted-foreground">({employee.specializedRegion})</span>}
                  </TableCell>
                  <TableCell className={cn(employee.status === 'suspended' && 'line-through')}>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                      {getAssignedCustomersCount(employee.id)}
                    </div>
                  </TableCell>
                   <TableCell>
                    <Badge 
                      variant={employee.status === 'active' ? 'default' : 'destructive'} 
                      className={cn("capitalize", employee.status === 'active' ? 'bg-green-500/80 hover:bg-green-500/70' : 'bg-red-500/80 hover:bg-red-500/70', 'text-white')}
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee)} aria-label="Edit employee"  disabled={employee.status === 'suspended'}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleToggleSuspension(employee)} 
                      aria-label={employee.status === 'active' ? "Suspend employee" : "Activate employee"}
                      className={cn(employee.status === 'active' ? "text-yellow-600 hover:text-yellow-500" : "text-green-600 hover:text-green-500")}
                    >
                      {employee.status === 'active' ? <Ban className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive/80" 
                      onClick={() => setEmployeeToDelete(employee)} 
                      aria-label="Delete employee"
                    >
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

