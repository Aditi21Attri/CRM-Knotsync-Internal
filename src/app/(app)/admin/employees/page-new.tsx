"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent } from "@/components/ui/animated-card";
import { AnimatedPage } from "@/components/ui/animated-page";
import { PlusCircle, Users, Edit2, Trash2, Ban, PlayCircle, AlertTriangle, Briefcase, Crown, UserCheck, Mail, MapPin } from "lucide-react";
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
import { StatCard } from "@/components/shared/StatCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  };

  const employeeStats = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const suspendedEmployees = employees.filter(emp => emp.status === 'suspended').length;
    const adminCount = employees.filter(emp => emp.role === 'admin').length;
    const employeeCount = employees.filter(emp => emp.role === 'employee').length;
    
    return {
      total: employees.length,
      active: activeEmployees,
      suspended: suspendedEmployees,
      admins: adminCount,
      employees: employeeCount
    };
  }, [employees]);

  if (dataLoading) return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading employees..." /></div>;

  return (
    <AnimatedPage className="space-y-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
          <PageHeader
            title="Employee Management Center"
            description="Manage team members, roles, and access permissions across your organization."
          />
          
          <motion.div 
            className="flex flex-wrap gap-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <AnimatedButton 
              onClick={handleAddEmployee} 
              variant="default" 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg glassmorphism"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Employee
            </AnimatedButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <StatCard 
          title="Total Staff" 
          value={employeeStats.total} 
          icon={Users} 
          className="glassmorphism border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
        />
        <StatCard 
          title="Active" 
          value={employeeStats.active} 
          icon={UserCheck} 
          className="glassmorphism border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
        />
        <StatCard 
          title="Suspended" 
          value={employeeStats.suspended} 
          icon={Ban} 
          className="glassmorphism border-red-500/20 bg-gradient-to-br from-red-500/10 to-pink-500/10"
        />
        <StatCard 
          title="Admins" 
          value={employeeStats.admins} 
          icon={Crown} 
          className="glassmorphism border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
        />
        <StatCard 
          title="Employees" 
          value={employeeStats.employees} 
          icon={Briefcase} 
          className="glassmorphism border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-yellow-500/10"
        />
      </motion.div>

      {/* Employee Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Team Directory
            </h3>
            <p className="text-muted-foreground">
              Manage all team members and their access permissions
            </p>
          </AnimatedCardHeader>
          <AnimatedCardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="w-16">Avatar</TableHead>
                    <TableHead className="font-semibold">Employee Details</TableHead>
                    <TableHead className="font-semibold">Role & Status</TableHead>
                    <TableHead className="font-semibold">Specialization</TableHead>
                    <TableHead className="font-semibold">Assigned Customers</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee, index) => {
                    const assignedCustomersCount = customers.filter(c => c.assignedTo === employee.id).length;
                    return (
                      <motion.tr
                        key={employee.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <Avatar className="h-12 w-12 border-2 border-border/50">
                            <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">{employee.name}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="mr-1 h-3 w-3" />
                              {employee.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge 
                              variant={employee.role === 'admin' ? 'default' : 'secondary'}
                              className={cn(
                                "capitalize font-medium",
                                employee.role === 'admin' 
                                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white" 
                                  : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                              )}
                            >
                              {employee.role === 'admin' && <Crown className="mr-1 h-3 w-3" />}
                              {employee.role === 'employee' && <Briefcase className="mr-1 h-3 w-3" />}
                              {employee.role}
                            </Badge>
                            <Badge 
                              variant={employee.status === 'active' ? 'default' : 'destructive'}
                              className={cn(
                                "capitalize",
                                employee.status === 'active' 
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                                  : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                              )}
                            >
                              {employee.status === 'active' ? <UserCheck className="mr-1 h-3 w-3" /> : <Ban className="mr-1 h-3 w-3" />}
                              {employee.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee.specializedRegion ? (
                            <div className="flex items-center text-sm">
                              <MapPin className="mr-1 h-3 w-3 text-accent" />
                              <span className="font-medium text-accent">{employee.specializedRegion}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No specialization</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <span className="font-semibold text-lg text-primary">{assignedCustomersCount}</span>
                            <p className="text-xs text-muted-foreground">customers</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                              className="hover:bg-primary/10 hover:border-primary/30"
                            >
                              <Edit2 className="h-4 w-4" />
                            </AnimatedButton>
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleSuspension(employee)}
                              className={cn(
                                "hover:border-yellow-500/30",
                                employee.status === 'active' ? "hover:bg-yellow-500/10" : "hover:bg-green-500/10"
                              )}
                            >
                              {employee.status === 'active' ? 
                                <Ban className="h-4 w-4 text-yellow-600" /> : 
                                <PlayCircle className="h-4 w-4 text-green-600" />
                              }
                            </AnimatedButton>
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              onClick={() => setEmployeeToDelete(employee)}
                              className="hover:bg-destructive/10 hover:border-destructive/30"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </AnimatedButton>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Empty State */}
      {employees.length === 0 && (
        <motion.div 
          className="text-center py-16 glassmorphism rounded-2xl border-dashed border-2 border-border/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Employees Found</h3>
          <p className="text-muted-foreground mb-6">
            Get started by adding your first team member.
          </p>
          <AnimatedButton 
            onClick={handleAddEmployee}
            variant="default"
            size="lg"
            className="bg-gradient-to-r from-primary to-accent"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add First Employee
          </AnimatedButton>
        </motion.div>
      )}

      {/* Dialogs */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setEditingEmployee(undefined); 
          }
        }}>
        <DialogContent className="sm:max-w-[600px] p-0 glassmorphism">
          {isFormOpen && (editingEmployee 
            ? <EmployeeForm employee={editingEmployee} onFormSubmit={() => { setIsFormOpen(false); setEditingEmployee(undefined); }} />
            : <EmployeeForm onFormSubmit={() => setIsFormOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!employeeToDelete} onOpenChange={(isOpen) => !isOpen && setEmployeeToDelete(null)}>
        <AlertDialogContent className="glassmorphism">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-6 w-6" />
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

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl" />
      </div>
    </AnimatedPage>
  );
}
