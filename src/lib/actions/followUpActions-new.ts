'use server';

import { connectToDatabase, getObjectId } from '@/lib/mongodb-server';
import type { FollowUpReminder, FollowUpStatus } from '@/lib/types';

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

export async function createFollowUpReminder(data: CreateFollowUpReminderData): Promise<FollowUpReminder> {
  try {
    const db = await connectToDatabase();
    const remindersCollection = db.collection('follow_up_reminders');
    
    const newReminder = {
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhoneNumber: data.customerPhoneNumber,
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      title: data.title,
      description: data.description || '',
      scheduledFor: data.scheduledFor,
      priority: data.priority || 'medium',
      status: 'pending' as FollowUpStatus,
      createdAt: new Date().toISOString(),
      notificationSent: false,
    };

    const result = await remindersCollection.insertOne(newReminder);
    return {
      id: result.insertedId.toString(),
      ...newReminder,
    };
  } catch (error) {
    console.error('Error creating follow-up reminder:', error);
    throw new Error('Failed to create follow-up reminder');
  }
}

export async function getFollowUpReminders(userId?: string): Promise<FollowUpReminder[]> {
  try {
    const db = await connectToDatabase();
    const remindersCollection = db.collection('follow_up_reminders');
    
    const query = userId ? { createdBy: userId } : {};
    const remindersFromDb = await remindersCollection
      .find(query)
      .sort({ scheduledFor: 1 })
      .toArray();
    
    return remindersFromDb.map((doc: any) => ({
      id: doc._id.toString(),
      customerId: doc.customerId,
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      customerPhoneNumber: doc.customerPhoneNumber,
      createdBy: doc.createdBy,
      createdByName: doc.createdByName,
      title: doc.title,
      description: doc.description,
      scheduledFor: doc.scheduledFor,
      priority: doc.priority,
      status: doc.status,
      createdAt: doc.createdAt,
      notificationSent: doc.notificationSent,
    }));
  } catch (error) {
    console.error('Error fetching follow-up reminders:', error);
    throw new Error('Failed to fetch follow-up reminders');
  }
}

export async function getFollowUpRemindersByCustomer(customerId: string): Promise<FollowUpReminder[]> {
  try {
    const db = await connectToDatabase();
    const remindersCollection = db.collection('follow_up_reminders');
    
    const remindersFromDb = await remindersCollection
      .find({ customerId })
      .sort({ scheduledFor: 1 })
      .toArray();
    
    return remindersFromDb.map((doc: any) => ({
      id: doc._id.toString(),
      customerId: doc.customerId,
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      customerPhoneNumber: doc.customerPhoneNumber,
      createdBy: doc.createdBy,
      createdByName: doc.createdByName,
      title: doc.title,
      description: doc.description,
      scheduledFor: doc.scheduledFor,
      priority: doc.priority,
      status: doc.status,
      createdAt: doc.createdAt,
      notificationSent: doc.notificationSent,
    }));
  } catch (error) {
    console.error('Error fetching customer reminders:', error);
    throw new Error('Failed to fetch customer reminders');
  }
}

export async function updateFollowUpReminderStatus(
  reminderId: string, 
  status: FollowUpStatus,
  completedBy?: string
): Promise<FollowUpReminder | null> {
  try {
    const db = await connectToDatabase();
    const remindersCollection = db.collection('follow_up_reminders');
    const ObjectId = await getObjectId();
    
    const updateData: any = { 
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updateData.completedAt = new Date().toISOString();
      if (completedBy) updateData.completedBy = completedBy;
    }
    
    const result = await remindersCollection.findOneAndUpdate(
      { _id: new ObjectId(reminderId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result.value) return null;
    
    const doc = result.value;
    return {
      id: doc._id.toString(),
      customerId: doc.customerId,
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      customerPhoneNumber: doc.customerPhoneNumber,
      createdBy: doc.createdBy,
      createdByName: doc.createdByName,
      title: doc.title,
      description: doc.description,
      scheduledFor: doc.scheduledFor,
      priority: doc.priority,
      status: doc.status,
      createdAt: doc.createdAt,
      notificationSent: doc.notificationSent,
    };
  } catch (error) {
    console.error('Error updating reminder status:', error);
    throw new Error('Failed to update reminder status');
  }
}

export async function deleteFollowUpReminder(reminderId: string): Promise<boolean> {
  try {
    const db = await connectToDatabase();
    const remindersCollection = db.collection('follow_up_reminders');
    const ObjectId = await getObjectId();
    
    const result = await remindersCollection.deleteOne({ _id: new ObjectId(reminderId) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw new Error('Failed to delete reminder');
  }
}

export async function getDueFollowUpReminders(): Promise<FollowUpReminder[]> {
  try {
    const db = await connectToDatabase();
    const remindersCollection = db.collection('follow_up_reminders');
    
    const now = new Date().toISOString();
    const remindersFromDb = await remindersCollection
      .find({
        scheduledFor: { $lte: now },
        status: 'pending',
        notificationSent: { $ne: true }
      })
      .sort({ scheduledFor: 1 })
      .toArray();
    
    return remindersFromDb.map((doc: any) => ({
      id: doc._id.toString(),
      customerId: doc.customerId,
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      customerPhoneNumber: doc.customerPhoneNumber,
      createdBy: doc.createdBy,
      createdByName: doc.createdByName,
      title: doc.title,
      description: doc.description,
      scheduledFor: doc.scheduledFor,
      priority: doc.priority,
      status: doc.status,
      createdAt: doc.createdAt,
      notificationSent: doc.notificationSent,
    }));
  } catch (error) {
    console.error('Error fetching due reminders:', error);
    throw new Error('Failed to fetch due reminders');
  }
}

export async function markReminderNotificationSent(reminderId: string): Promise<void> {
  try {
    const db = await connectToDatabase();
    const remindersCollection = db.collection('follow_up_reminders');
    const ObjectId = await getObjectId();
    
    await remindersCollection.updateOne(
      { _id: new ObjectId(reminderId) },
      { 
        $set: { 
          notificationSent: true,
          notificationSentAt: new Date().toISOString()
        }
      }
    );
  } catch (error) {
    console.error('Error marking reminder notification as sent:', error);
    throw new Error('Failed to mark reminder notification as sent');
  }
}

export async function getOverdueFollowUpReminders(): Promise<FollowUpReminder[]> {
  try {
    const db = await connectToDatabase();
    const remindersCollection = db.collection('follow_up_reminders');
    
    const now = new Date().toISOString();
    const remindersFromDb = await remindersCollection
      .find({
        scheduledFor: { $lt: now },
        status: 'pending'
      })
      .sort({ scheduledFor: 1 })
      .toArray();
    
    return remindersFromDb.map((doc: any) => ({
      id: doc._id.toString(),
      customerId: doc.customerId,
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      customerPhoneNumber: doc.customerPhoneNumber,
      createdBy: doc.createdBy,
      createdByName: doc.createdByName,
      title: doc.title,
      description: doc.description,
      scheduledFor: doc.scheduledFor,
      priority: doc.priority,
      status: doc.status,
      createdAt: doc.createdAt,
      notificationSent: doc.notificationSent,
    }));
  } catch (error) {
    console.error('Error fetching overdue reminders:', error);
    throw new Error('Failed to fetch overdue reminders');
  }
}

// Helper function to update overdue reminders
export async function updateOverdueReminders(): Promise<void> {
  try {
    const overdueReminders = await getOverdueFollowUpReminders();
    
    for (const reminder of overdueReminders) {
      await updateFollowUpReminderStatus(reminder.id, 'overdue');
    }
  } catch (error) {
    console.error('Error updating overdue reminders:', error);
    throw new Error('Failed to update overdue reminders');
  }
}
