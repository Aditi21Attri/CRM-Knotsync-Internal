import type { FollowUpReminder, FollowUpStatus } from '@/lib/types';

// Mock data store - In a real app, this would be your database
let followUpReminders: FollowUpReminder[] = [];
let reminderIdCounter = 1;

export interface CreateFollowUpReminderData {
  customerId: string;
  customerName: string;
  createdBy: string;
  createdByName: string;
  title: string;
  description?: string;
  scheduledFor: string; // ISO date string
  priority?: 'low' | 'medium' | 'high';
}

export async function createFollowUpReminder(data: CreateFollowUpReminderData): Promise<FollowUpReminder> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const newReminder: FollowUpReminder = {
    id: (reminderIdCounter++).toString(),
    customerId: data.customerId,
    customerName: data.customerName,
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    title: data.title,
    description: data.description,
    scheduledFor: data.scheduledFor,
    status: 'pending',
    createdAt: new Date().toISOString(),
    priority: data.priority || 'medium',
    notificationSent: false,
  };

  followUpReminders.push(newReminder);
  return newReminder;
}

export async function getFollowUpReminders(userId?: string): Promise<FollowUpReminder[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // If userId is provided, filter reminders for that user (for employees)
  // Admins can see all reminders
  if (userId) {
    return followUpReminders.filter(reminder => reminder.createdBy === userId);
  }
  
  return followUpReminders.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

export async function getFollowUpRemindersByCustomer(customerId: string): Promise<FollowUpReminder[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return followUpReminders
    .filter(reminder => reminder.customerId === customerId)
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

export async function updateFollowUpReminderStatus(
  reminderId: string, 
  status: FollowUpStatus,
  completedBy?: string
): Promise<FollowUpReminder | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const reminderIndex = followUpReminders.findIndex(r => r.id === reminderId);
  if (reminderIndex === -1) return null;

  const updatedReminder = {
    ...followUpReminders[reminderIndex],
    status,
    updatedAt: new Date().toISOString(),
    ...(status === 'completed' && { completedAt: new Date().toISOString() }),
  };

  followUpReminders[reminderIndex] = updatedReminder;
  return updatedReminder;
}

export async function deleteFollowUpReminder(reminderId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const initialLength = followUpReminders.length;
  followUpReminders = followUpReminders.filter(r => r.id !== reminderId);
  return followUpReminders.length < initialLength;
}

export async function getDueFollowUpReminders(): Promise<FollowUpReminder[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const now = new Date();
  return followUpReminders.filter(reminder => 
    reminder.status === 'pending' && 
    new Date(reminder.scheduledFor) <= now &&
    !reminder.notificationSent
  );
}

export async function markReminderNotificationSent(reminderId: string): Promise<void> {
  const reminderIndex = followUpReminders.findIndex(r => r.id === reminderId);
  if (reminderIndex !== -1) {
    followUpReminders[reminderIndex].notificationSent = true;
  }
}

export async function getOverdueFollowUpReminders(): Promise<FollowUpReminder[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const now = new Date();
  return followUpReminders.filter(reminder => 
    reminder.status === 'pending' && 
    new Date(reminder.scheduledFor) < now
  );
}

// Helper function to update overdue reminders
export async function updateOverdueReminders(): Promise<void> {
  const overdueReminders = await getOverdueFollowUpReminders();
  
  for (const reminder of overdueReminders) {
    await updateFollowUpReminderStatus(reminder.id, 'overdue');
  }
}
