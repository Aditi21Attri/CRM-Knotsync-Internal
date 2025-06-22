// Client-side API wrapper functions
// These functions make HTTP requests to API routes instead of importing server-side code directly

import type { 
  Customer, 
  User, 
  MappedCustomerData, 
  CustomerStatus, 
  UserRole, 
  UserStatus, 
  FollowUpReminder, 
  FollowUpStatus 
} from '@/lib/types';

// Customer API functions
export async function getCustomersAPI(): Promise<Customer[]> {
  const response = await fetch('/api/customers');
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch customers');
  return data.customers;
}

export async function addCustomerAPI(customerData: Partial<Customer>): Promise<Customer> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to add customer');
  return data.customer;
}

export async function updateCustomerAPI(id: string, updates: Partial<Customer>): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to update customer');
  return data.customer;
}

export async function assignCustomerAPI(customerId: string, employeeId: string): Promise<Customer> {
  const response = await fetch(`/api/customers/${customerId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId })
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to assign customer');
  return data.customer;
}

export async function updateCustomerStatusAPI(customerId: string, status: CustomerStatus, notes?: string): Promise<Customer> {
  const response = await fetch(`/api/customers/${customerId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to update customer status');
  return data.customer;
}

export async function deleteCustomerAPI(customerId: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`/api/customers/${customerId}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete customer');
  return data;
}

// User/Employee API functions
export async function getUsersAPI(): Promise<User[]> {
  const response = await fetch('/api/users');
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch users');
  return data.users;
}

export async function getEmployeesAPI(): Promise<User[]> {
  const response = await fetch('/api/employees');
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch employees');
  return data.employees;
}

export interface EmployeeData {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  phoneNumber?: string;
  department?: string;
  status?: UserStatus;
}

export async function addEmployeeAPI(employeeData: EmployeeData): Promise<User> {
  const response = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to add employee');
  return data.employee;
}

export async function updateEmployeeAPI(id: string, updates: Partial<EmployeeData>): Promise<User> {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to update employee');
  return data.employee;
}

export async function deleteEmployeeAPI(id: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete employee');
  return data;
}

export async function toggleEmployeeSuspensionAPI(id: string): Promise<User> {
  const response = await fetch(`/api/employees/${id}/toggle-suspension`, {
    method: 'POST'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to toggle employee suspension');
  return data.employee;
}

// Follow-up reminder API functions
export interface CreateFollowUpReminderData {
  customerId: string;
  customerName: string;
  createdBy: string;
  createdByName: string;
  title: string;
  description?: string;
  scheduledFor: string; // ISO date string
  priority?: 'low' | 'medium' | 'high';
  customerEmail?: string;
  customerPhoneNumber?: string;
}

export async function createFollowUpReminderAPI(reminderData: CreateFollowUpReminderData): Promise<FollowUpReminder> {
  const response = await fetch('/api/follow-up-reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminderData)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to create follow-up reminder');
  return data.reminder;
}

export async function getFollowUpRemindersAPI(): Promise<FollowUpReminder[]> {
  const response = await fetch('/api/follow-up-reminders');
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch follow-up reminders');
  return data.reminders;
}

export async function getFollowUpRemindersByCustomerAPI(customerId: string): Promise<FollowUpReminder[]> {
  const response = await fetch(`/api/follow-up-reminders?customerId=${customerId}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch customer reminders');
  return data.reminders;
}

export async function updateFollowUpReminderStatusAPI(id: string, status: FollowUpStatus): Promise<void> {
  const response = await fetch(`/api/follow-up-reminders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to update reminder status');
}

export async function deleteFollowUpReminderAPI(id: string): Promise<void> {
  const response = await fetch(`/api/follow-up-reminders/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete reminder');
}

export async function getDueFollowUpRemindersAPI(): Promise<FollowUpReminder[]> {
  const response = await fetch('/api/follow-up-reminders/due');
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch due reminders');
  return data.reminders;
}

// Authentication API functions
export async function authenticateUserAPI(email: string, password: string): Promise<User | null> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!data.success) return null;
  return data.user;
}

export async function createInitialAdminAPI(adminData: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const response = await fetch('/api/auth/create-initial-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminData)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to create admin');
  return data.user;
}

// Manual customer add
export interface ManualAddCustomerFormData {
  name: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  notes?: string;
  source: string;
  assignedTo?: string;
}

export async function handleManualAddCustomerAPI(customerData: ManualAddCustomerFormData): Promise<Customer> {
  const response = await fetch('/api/customers/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to add customer manually');
  return data.customer;
}

export async function deleteAllCustomersAPI(): Promise<{ success: boolean; deletedCount: number }> {
  const response = await fetch('/api/customers', {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete all customers');
  return data;
}

export async function markReminderNotificationSentAPI(reminderId: string): Promise<void> {
  const response = await fetch(`/api/follow-up-reminders/${reminderId}/mark-sent`, {
    method: 'POST'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to mark reminder notification as sent');
}

export async function deleteLeadAPI(leadId: string, soft: boolean = false): Promise<{ success: boolean; message?: string }> {
  const url = soft ? `/api/leads/${leadId}?soft=true` : `/api/leads/${leadId}`;
  const response = await fetch(url, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete lead');
  return data;
}
