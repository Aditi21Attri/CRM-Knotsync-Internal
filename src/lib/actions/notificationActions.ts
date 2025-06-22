import { connectToDatabase, getObjectId } from '@/lib/mongodb-server';
import type { Notification, NotificationStatus, NotificationType } from '@/lib/types';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  reminderId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('email' | 'whatsapp' | 'browser' | 'sms')[];
  scheduledFor?: Date;
  metadata?: any;
}

// Create a notification record in the database
export async function createNotification(data: NotificationData): Promise<Notification> {
  const db = await connectToDatabase();
  const notificationsCollection = db.collection('notifications');
  
  const notification = {
    ...data,
    status: 'pending' as NotificationStatus,
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sentAt: undefined,
    readAt: undefined,
    emailSent: false,
    whatsappSent: false,
    browserSent: false,
    smsSent: false,
    emailSentAt: undefined,
    whatsappSentAt: undefined,
    browserSentAt: undefined,
    smsSentAt: undefined,
    errors: []
  };

  const result = await notificationsCollection.insertOne(notification);
  if (!result.insertedId) throw new Error('Failed to create notification');

  return { id: result.insertedId.toString(), ...notification } as Notification;
}

// Get notifications for a user
export async function getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
  const db = await connectToDatabase();
  const notificationsCollection = db.collection('notifications');
  
  const notifications = await notificationsCollection
    .find({ recipientId: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return notifications.map((notification: any) => ({
    id: notification._id.toString(),
    ...notification
  })) as Notification[];
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const db = await connectToDatabase();
  const notificationsCollection = db.collection('notifications');
  
  return await notificationsCollection.countDocuments({
    recipientId: userId,
    readAt: { $exists: false }
  });
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const db = await connectToDatabase();
  const notificationsCollection = db.collection('notifications');
  const ObjectId = await getObjectId();
  
  const result = await notificationsCollection.updateOne(
    { _id: new ObjectId(notificationId) },
    { 
      $set: { 
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } 
    }
  );

  return result.modifiedCount > 0;
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const db = await connectToDatabase();
  const notificationsCollection = db.collection('notifications');
  
  const result = await notificationsCollection.updateMany(
    { recipientId: userId, readAt: { $exists: false } },
    { 
      $set: { 
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } 
    }
  );

  return result.modifiedCount;
}

// Update notification status
export async function updateNotificationStatus(
  notificationId: string, 
  status: NotificationStatus, 
  channel?: string,
  error?: string
): Promise<boolean> {
  const db = await connectToDatabase();
  const notificationsCollection = db.collection('notifications');
  const ObjectId = await getObjectId();
  
  const updateData: any = {
    status,
    updatedAt: new Date().toISOString()
  };

  if (status === 'sent') {
    updateData.sentAt = new Date().toISOString();
    if (channel) {
      updateData[`${channel}Sent`] = true;
      updateData[`${channel}SentAt`] = new Date().toISOString();
    }
  }

  if (error) {
    updateData.$push = { errors: { message: error, timestamp: new Date().toISOString() } };
    updateData.$inc = { attempts: 1 };
  }

  const result = await notificationsCollection.updateOne(
    { _id: new ObjectId(notificationId) },
    updateData
  );

  return result.modifiedCount > 0;
}

// Get pending notifications to process
export async function getPendingNotifications(): Promise<Notification[]> {
  const db = await connectToDatabase();
  const notificationsCollection = db.collection('notifications');
  
  const now = new Date().toISOString();
  
  const notifications = await notificationsCollection
    .find({
      status: 'pending',
      attempts: { $lt: 3 }, // Max 3 attempts
      $or: [
        { scheduledFor: { $exists: false } },
        { scheduledFor: null },
        { scheduledFor: { $lte: now } }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(100)
    .toArray();

  return notifications.map((notification: any) => ({
    id: notification._id.toString(),
    ...notification
  })) as Notification[];
}

// Delete old notifications (cleanup)
export async function cleanupOldNotifications(daysOld = 30): Promise<number> {
  const db = await connectToDatabase();
  const notificationsCollection = db.collection('notifications');
  
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
  
  const result = await notificationsCollection.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ['sent', 'failed'] }
  });

  return result.deletedCount || 0;
}
