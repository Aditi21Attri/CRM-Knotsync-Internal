
export type UserRole = 'admin' | 'employee';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored for mock authentication. In real app, use passwordHash.
  role: UserRole;
  status?: UserStatus; // Optional for existing users, will default to 'active'
  avatarUrl?: string;
  specializedRegion?: string; // e.g., "USA", "Australia", "UK"
  // assignedCustomerIds: string[]; // This is an alternative data model.
  // Currently, customer assignment is handled by Customer.assignedTo (employee ID).
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export type CustomerStatus = 'hot' | 'cold' | 'neutral';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  category?: string; // Generic category/tag, e.g., 'USA', 'UK', 'Tech Lead'. Used for regional matching.
  status: CustomerStatus;
  assignedTo: string | null; // Employee ID
  notes?: string;
  lastContacted?: string; // ISO date string
  // Additional generic fields from Excel can be added here or handled dynamically
  [key: string]: any; 
}

export interface Employee extends User {
  // Employee specific fields, if any, beyond what User provides.
  // For now, it's structurally same as User but with a specific role.
  role: 'employee';
}

// Data structure for mock Excel rows
export interface ExcelRowData {
  [key: string]: string | number;
}

// Represents the data structure after admin has mapped Excel columns
// It's essentially what a new Customer object would look like before ID, status, assignment.
export interface MappedCustomerData extends Omit<Customer, 'id' | 'status' | 'assignedTo' | 'lastContacted' | 'notes'> {
  // Fields are dynamically determined by Excel import and mapping
}
