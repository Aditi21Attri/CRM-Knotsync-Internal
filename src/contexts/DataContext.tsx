
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Customer, User, MappedCustomerData, CustomerStatus, UserRole } from '@/lib/types';
import { mockCustomers, mockUsers } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface EmployeeCreationData {
  name: string;
  email: string;
  role: UserRole;
}

interface DataContextType {
  customers: Customer[];
  users: User[]; // Includes admins and employees
  employees: User[]; // Filtered list of only employees
  addCustomer: (customerData: MappedCustomerData, assignedTo?: string | null, status?: CustomerStatus) => void;
  updateCustomer: (updatedCustomer: Customer) => void;
  assignCustomer: (customerId: string, employeeId: string | null) => void;
  updateCustomerStatus: (customerId: string, status: CustomerStatus, notes?: string) => void;
  addEmployee: (employeeData: EmployeeCreationData) => void;
  updateEmployee: (employeeId: string, updatedData: Partial<EmployeeCreationData>) => void;
  dataLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setCustomers(mockCustomers);
      setUsers(mockUsers);
      setDataLoading(false);
    }, 500);
  }, []);

  const employees = users.filter(user => user.role === 'employee');

  const addCustomer = (customerData: MappedCustomerData, assignedTo: string | null = null, status: CustomerStatus = 'neutral') => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust${Date.now()}${Math.random().toString(36).substring(2, 7)}`,
      status,
      assignedTo,
      lastContacted: new Date().toISOString(),
      notes: customerData.notes || '',
    };
    setCustomers(prev => [newCustomer, ...prev]);
    toast({ title: "Customer Added", description: `${newCustomer.name} has been added successfully.` });
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? {...c, ...updatedCustomer, lastContacted: new Date().toISOString()} : c));
    toast({ title: "Customer Updated", description: `${updatedCustomer.name}'s details have been updated.` });
  };
  
  const assignCustomer = (customerId: string, employeeId: string | null) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, assignedTo: employeeId, lastContacted: new Date().toISOString() } : c));
    const customer = customers.find(c => c.id === customerId);
    const employee = users.find(u => u.id === employeeId);
    if (customer) {
      toast({ title: "Customer Assigned", description: `${customer.name} assigned to ${employee ? employee.name : 'Unassigned'}.` });
    }
  };

  const updateCustomerStatus = (customerId: string, status: CustomerStatus, notes?: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { 
          ...c, 
          status, 
          notes: notes ? (c.notes ? `${c.notes}\n${new Date().toLocaleDateString()}: ${notes}` : `${new Date().toLocaleDateString()}: ${notes}`) : c.notes,
          lastContacted: new Date().toISOString() 
        };
      }
      return c;
    }));
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      toast({ title: "Customer Status Updated", description: `${customer.name} status set to ${status}.` });
    }
  };

  const addEmployee = (employeeData: EmployeeCreationData) => {
    const newEmployee: User = {
      ...employeeData,
      id: `emp${Date.now()}${Math.random().toString(36).substring(2, 5)}`,
      avatarUrl: `https://placehold.co/100x100/E5EAF7/2962FF?text=${employeeData.name.substring(0,2).toUpperCase()}`, // Using initials for placeholder
    };
    setUsers(prev => [newEmployee, ...prev]);
    toast({ title: "Employee Added", description: `${newEmployee.name} has been added as an ${newEmployee.role}.` });
  };

  const updateEmployee = (employeeId: string, updatedData: Partial<EmployeeCreationData>) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === employeeId 
          ? { ...user, ...updatedData, avatarUrl: user.avatarUrl || `https://placehold.co/100x100/E5EAF7/2962FF?text=${(updatedData.name || user.name).substring(0,2).toUpperCase()}` } // Retain or update avatar
          : user
      )
    );
    const employee = users.find(u => u.id === employeeId);
    if (employee) {
      toast({ title: "Employee Updated", description: `${updatedData.name || employee.name}'s details have been updated.`});
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
      dataLoading
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
