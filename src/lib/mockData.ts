import type { User, Customer, UserRole, CustomerStatus } from './types';

export const mockUsers: User[] = [
  { id: 'admin001', name: 'Admin User', email: 'admin@stratagem.crm', role: 'admin', avatarUrl: 'https://placehold.co/100x100' },
  { id: 'emp001', name: 'Alice Wonderland', email: 'alice@stratagem.crm', role: 'employee', avatarUrl: 'https://placehold.co/100x100' },
  { id: 'emp002', name: 'Bob The Builder', email: 'bob@stratagem.crm', role: 'employee', avatarUrl: 'https://placehold.co/100x100' },
  { id: 'emp003', name: 'Charlie Chaplin', email: 'charlie@stratagem.crm', role: 'employee', avatarUrl: 'https://placehold.co/100x100' },
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
  { 
    id: 'cust003', 
    name: 'Legacy Systems', 
    email: 'support@legacysys.org', 
    phoneNumber: '555-0103', 
    category: 'SMB', 
    status: 'cold', 
    assignedTo: 'emp002',
    notes: 'Decided to go with a competitor.',
    lastContacted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  { 
    id: 'cust004', 
    name: 'Future Solutions', 
    email: 'ceo@futuresolutions.io', 
    phoneNumber: '555-0104', 
    category: 'Enterprise', 
    status: 'hot', 
    assignedTo: 'emp002',
    notes: 'Ready to sign, contract sent.',
    lastContacted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  { 
    id: 'cust005', 
    name: 'Alpha Ventures', 
    email: 'invest@alphaventures.vc', 
    phoneNumber: '555-0105', 
    category: 'VC', 
    status: 'neutral', 
    assignedTo: null, // Unassigned
    notes: 'New lead, needs initial contact.',
  },
    { 
    id: 'cust006', 
    name: 'Beta Tech', 
    email: 'tech@beta.io', 
    phoneNumber: '555-0106', 
    category: 'Startup', 
    status: 'hot', 
    assignedTo: 'emp003',
    notes: 'Successful onboarding.',
    lastContacted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  { 
    id: 'cust007', 
    name: 'Gamma Industries', 
    email: 'gamma@industry.com', 
    phoneNumber: '555-0107', 
    category: 'SMB', 
    status: 'cold', 
    assignedTo: 'emp003',
    notes: 'Budget constraints.',
    lastContacted: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const getEmployeeNameById = (employeeId: string | null): string => {
  if (!employeeId) return 'Unassigned';
  const employee = mockUsers.find(user => user.id === employeeId && user.role === 'employee');
  return employee ? employee.name : 'Unknown Employee';
};
