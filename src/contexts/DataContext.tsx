
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Customer, User, MappedCustomerData, CustomerStatus, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCustomers, addCustomerAction, updateCustomerAction, assignCustomerAction, updateCustomerStatusAction } from '@/lib/actions/customerActions';
import { getUsers as getUsersAction, getEmployees as getEmployeesAction, addEmployeeAction, updateEmployeeAction, type EmployeeData } from '@/lib/actions/userActions'; // Import EmployeeData

// Use EmployeeData for creation, ensuring password is required for new employees
interface EmployeeCreationData extends Required<Pick<EmployeeData, 'name' | 'email' | 'role' | 'password'>>, Partial<Omit<EmployeeData, 'name' | 'email' | 'role' | 'password'>> {}
interface EmployeeUpdateData extends Partial<Omit<EmployeeData, 'password'>> {}


interface DataContextType {
  customers: Customer[];
  users: User[]; 
  employees: User[]; 
  addCustomer: (customerData: MappedCustomerData, assignedTo?: string | null, status?: CustomerStatus) => Promise<void>;
  updateCustomer: (customerId: string, updatedData: Partial<Customer>) => Promise<void>;
  assignCustomer: (customerId: string, employeeId: string | null) => Promise<void>;
  updateCustomerStatus: (customerId: string, status: CustomerStatus, notes?: string) => Promise<void>;
  addEmployee: (employeeData: EmployeeCreationData) => Promise<void>;
  updateEmployee: (employeeId: string, updatedData: EmployeeUpdateData) => Promise<void>;
  dataLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [fetchedCustomers, fetchedUsers, fetchedEmployees] = await Promise.all([
        getCustomers(),
        getUsersAction(),
        getEmployeesAction()
      ]);
      setCustomers(fetchedCustomers);
      setUsers(fetchedUsers);
      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error Loading Data",
        description: "Could not load data from the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCustomer = async (customerData: MappedCustomerData, assignedTo: string | null = null, status: CustomerStatus = 'neutral') => {
    try {
      const newCustomer = await addCustomerAction(customerData, assignedTo, status);
      setCustomers(prev => [newCustomer, ...prev]);
      // Toast is handled in ExcelImportForm for more specific messaging
    } catch (error) {
      console.error("Failed to add customer:", error);
      toast({ title: "Error", description: "Failed to add customer.", variant: "destructive" });
    }
  };

  const updateCustomer = async (customerId: string, updatedData: Partial<Customer>) => {
    try {
      const updatedCustomer = await updateCustomerAction(customerId, updatedData);
      if (updatedCustomer) {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        toast({ title: "Customer Updated", description: `${updatedCustomer.name}'s details have been updated.` });
      } else {
        throw new Error("Customer not found or update failed");
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast({ title: "Error", description: "Failed to update customer.", variant: "destructive" });
    }
  };
  
  const assignCustomer = async (customerId: string, employeeId: string | null) => {
    try {
      const updatedCustomer = await assignCustomerAction(customerId, employeeId);
      if (updatedCustomer) {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        const employee = users.find(u => u.id === employeeId);
        toast({ title: "Customer Assigned", description: `${updatedCustomer.name} assigned to ${employee ? employee.name : 'Unassigned'}.` });
      } else {
        throw new Error("Customer not found or assignment failed");
      }
    } catch (error) {
      console.error("Failed to assign customer:", error);
      toast({ title: "Error", description: "Failed to assign customer.", variant: "destructive" });
    }
  };

  const updateCustomerStatus = async (customerId: string, status: CustomerStatus, notes?: string) => {
    try {
      const updatedCustomer = await updateCustomerStatusAction(customerId, status, notes);
      if (updatedCustomer) {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        toast({ title: "Customer Status Updated", description: `${updatedCustomer.name} status set to ${status}.` });
      } else {
        throw new Error("Customer not found or status update failed");
      }
    } catch (error) {
      console.error("Failed to update customer status:", error);
      toast({ title: "Error", description: "Failed to update customer status.", variant: "destructive" });
    }
  };

  const addEmployee = async (employeeData: EmployeeCreationData) => {
    try {
      // Ensure password is provided, which EmployeeCreationData type now enforces
      const newEmployee = await addEmployeeAction(employeeData); 
      setUsers(prev => [newEmployee, ...prev]);
      if (newEmployee.role === 'employee') {
        setEmployees(prev => [newEmployee, ...prev]);
      }
      toast({ title: "Employee Added", description: `${newEmployee.name} has been added as an ${newEmployee.role}.` });
    } catch (error) {
      console.error("Failed to add employee:", error);
      toast({ title: "Error", description: `Failed to add employee: ${error instanceof Error ? error.message : "Unknown error"}`, variant: "destructive" });
    }
  };

  const updateEmployee = async (employeeId: string, updatedData: EmployeeUpdateData) => {
    try {
      const updatedEmployee = await updateEmployeeAction(employeeId, updatedData);
      if (updatedEmployee) {
        setUsers(prevUsers => prevUsers.map(user => user.id === updatedEmployee.id ? updatedEmployee : user));
        
        const isCurrentlyEmployee = employees.some(emp => emp.id === updatedEmployee.id);
        if (updatedEmployee.role === 'employee') {
          if (isCurrentlyEmployee) {
            setEmployees(prevEmps => prevEmps.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
          } else {
            // If role changed to employee
            setEmployees(prevEmps => [...prevEmps.filter(emp => emp.id !== updatedEmployee.id), updatedEmployee]);
          }
        } else { 
          setEmployees(prevEmps => prevEmps.filter(emp => emp.id !== updatedEmployee.id));
        }
        toast({ title: "Employee Updated", description: `${updatedEmployee.name}'s details have been updated.`});
      } else {
        throw new Error("Employee not found or update failed");
      }
    } catch (error) {
      console.error("Failed to update employee:", error);
      toast({ title: "Error", description: `Failed to update employee: ${error instanceof Error ? error.message : "Unknown error"}`, variant: "destructive" });
    }
  };

  return (
    <DataContext.Provider value={{ 
      customers, 
      users, 
      employees, 
      addCustomer, 
      updateCustomer,
      assignCustomer, 
      updateCustomerStatus, 
      addEmployee,
      updateEmployee,
      dataLoading,
      refreshData: fetchData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
