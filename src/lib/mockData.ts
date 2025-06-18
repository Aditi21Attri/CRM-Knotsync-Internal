
import type { User, Customer, UserRole, CustomerStatus } from './types';

// Note: mockUsers and mockCustomers will no longer be the primary source of data
// after MongoDB integration. They can be kept for reference or seeding scripts.

export const mockUsers: User[] = [
  { id: 'admin001', name: 'Admin User', email: 'admin@crm.com', role: 'admin', avatarUrl: 'https://placehold.co/100x100/cccccc/2962ff' },
  { id: 'emp001', name: 'Alice Wonderland', email: 'alice@stratagem.crm', role: 'employee', avatarUrl: 'https://placehold.co/100x100/E5EAF7/2962FF' },
  { id: 'emp002', name: 'Bob The Builder', email: 'bob@stratagem.crm', role: 'employee', avatarUrl: 'https://placehold.co/100x100/E5EAF7/8A2BE2' },
  { id: 'emp003', name: 'Charlie Chaplin', email: 'charlie@stratagem.crm', role: 'employee', avatarUrl: 'https://placehold.co/100x100/E5EAF7/FFD700' },
];

export const mockCustomers: Customer[] = [
  { 
    id: 'cust001', 
    name: 'Global Corp', 
    email: 'contact@globalcorp.com', 
    phoneNumber: '555-0101', 
    category: 'Enterprise', 
    status: 'hot', 
    assignedTo: 'emp001', 
    notes: 'Interested in premium package. Follow up next week.',
    lastContacted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  { 
    id: 'cust002', 
    name: 'Innovate LLC', 
    email: 'info@innovatellc.dev', 
    phoneNumber: '555-0102', 
    category: 'Startup', 
    status: 'neutral', 
    assignedTo: 'emp001',
    notes: 'Evaluating options, needs more info on integration.',
    lastContacted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  // Add more mock customers if needed for initial seeding or reference
];

// This function is no longer suitable as employee data will come from DataContext (DB)
// export const getEmployeeNameById = (employeeId: string | null): string => {
//   if (!employeeId) return 'Unassigned';
//   const employee = mockUsers.find(user => user.id === employeeId && user.role === 'employee');
//   return employee ? employee.name : 'Unknown Employee';
// };
