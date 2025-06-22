import { 
  createNotification, 
  getPendingNotifications, 
  updateNotificationStatus,
  type NotificationData 
} from '@/lib/actions/notificationActions';
import { sendEmail, emailTemplates } from '@/lib/services/emailService';
import { sendWhatsAppMessage, whatsappTemplates } from '@/lib/services/whatsappService';
import type { Notification, NotificationType } from '@/lib/types';

// Central notification processing service
export class NotificationProcessor {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  // Start processing notifications periodically
  start(intervalMs = 30000): void {
    if (typeof window !== 'undefined') {
      console.warn('⚠️ [NOTIFICATION PROCESSOR] Cannot start on client-side');
      return;
    }

    if (this.processingInterval) {
      this.stop();
    }

    console.log('🚀 [NOTIFICATION PROCESSOR] Starting notification processor...');
    this.processingInterval = setInterval(() => {
      this.processNotifications();
    }, intervalMs);

    // Process immediately on start
    this.processNotifications();
  }

  // Stop processing notifications
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('⏹️ [NOTIFICATION PROCESSOR] Stopped notification processor');
    }
  }

  // Process all pending notifications
  async processNotifications(): Promise<void> {
    if (this.isProcessing) {
      console.log('⏭️ [NOTIFICATION PROCESSOR] Already processing, skipping...');
      return;
    }

    this.isProcessing = true;
    
    try {
      console.log('🔄 [NOTIFICATION PROCESSOR] Fetching pending notifications...');
      const pendingNotifications = await getPendingNotifications();
      
      if (pendingNotifications.length === 0) {
        console.log('✅ [NOTIFICATION PROCESSOR] No pending notifications');
        return;
      }

      console.log(`📋 [NOTIFICATION PROCESSOR] Processing ${pendingNotifications.length} notifications`);

      for (const notification of pendingNotifications) {
        await this.processNotification(notification);
      }

      console.log('✅ [NOTIFICATION PROCESSOR] Completed processing all notifications');
    } catch (error) {
      console.error('❌ [NOTIFICATION PROCESSOR] Error processing notifications:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process a single notification
  private async processNotification(notification: Notification): Promise<void> {
    console.log(`🔄 [NOTIFICATION PROCESSOR] Processing notification ${notification.id} of type ${notification.type}`);    const results = {
      email: { success: false, error: '' as string },
      whatsapp: { success: false, error: '' as string },
      browser: { success: false, error: '' as string }
    };

    // Process email channel
    if (notification.channels.includes('email') && !notification.emailSent) {
      try {
        const emailData = this.getEmailData(notification);
        if (emailData) {
          const result = await sendEmail(
            notification.recipientEmail,
            emailData.subject,
            emailData.html,
            emailData.text
          );

          results.email = { success: result.success, error: result.error || '' };
          
          if (result.success) {
            await updateNotificationStatus(notification.id, 'sent', 'email');
            console.log(`✅ [NOTIFICATION PROCESSOR] Email sent for notification ${notification.id}`);
          } else {
            await updateNotificationStatus(notification.id, 'failed', 'email', result.error);
            console.error(`❌ [NOTIFICATION PROCESSOR] Email failed for notification ${notification.id}:`, result.error);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.email = { success: false, error: errorMessage };
        await updateNotificationStatus(notification.id, 'failed', 'email', errorMessage);
        console.error(`❌ [NOTIFICATION PROCESSOR] Email error for notification ${notification.id}:`, error);
      }
    }

    // Process WhatsApp channel
    if (notification.channels.includes('whatsapp') && !notification.whatsappSent && notification.recipientPhone) {
      try {
        const whatsappMessage = this.getWhatsAppMessage(notification);
        if (whatsappMessage) {
          const result = await sendWhatsAppMessage(notification.recipientPhone, whatsappMessage);
          
          results.whatsapp = { success: result.success, error: result.error || '' };
          
          if (result.success) {
            await updateNotificationStatus(notification.id, 'sent', 'whatsapp');
            console.log(`✅ [NOTIFICATION PROCESSOR] WhatsApp sent for notification ${notification.id}`);
          } else {
            await updateNotificationStatus(notification.id, 'failed', 'whatsapp', result.error);
            console.error(`❌ [NOTIFICATION PROCESSOR] WhatsApp failed for notification ${notification.id}:`, result.error);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.whatsapp = { success: false, error: errorMessage };
        await updateNotificationStatus(notification.id, 'failed', 'whatsapp', errorMessage);
        console.error(`❌ [NOTIFICATION PROCESSOR] WhatsApp error for notification ${notification.id}:`, error);
      }
    }

    // Process browser notification
    if (notification.channels.includes('browser') && !notification.browserSent) {
      try {
        // Browser notifications are handled client-side, mark as sent
        await updateNotificationStatus(notification.id, 'sent', 'browser');
        results.browser = { success: true, error: '' };
        console.log(`✅ [NOTIFICATION PROCESSOR] Browser notification marked for notification ${notification.id}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.browser = { success: false, error: errorMessage };
        console.error(`❌ [NOTIFICATION PROCESSOR] Browser notification error for notification ${notification.id}:`, error);
      }
    }

    // Update overall status based on results
    const allChannelsCompleted = notification.channels.every(channel => {
      if (channel === 'email') return notification.emailSent || results.email.success;
      if (channel === 'whatsapp') return notification.whatsappSent || results.whatsapp.success;
      if (channel === 'browser') return notification.browserSent || results.browser.success;
      return true;
    });

    if (allChannelsCompleted) {
      await updateNotificationStatus(notification.id, 'sent');
      console.log(`✅ [NOTIFICATION PROCESSOR] All channels completed for notification ${notification.id}`);
    }
  }

  // Get email data based on notification type
  private getEmailData(notification: Notification): { subject: string; html: string; text: string } | null {
    switch (notification.type) {
      case 'lead_assigned':
        return emailTemplates.leadAssigned({
          employeeName: notification.recipientName,
          leadName: notification.customerName || 'Unknown',
          leadEmail: notification.metadata?.leadEmail || '',
          leadPhone: notification.metadata?.leadPhone,
          source: notification.metadata?.source || 'Unknown'
        });

      case 'welcome_message':
        return emailTemplates.leadWelcome({
          leadName: notification.recipientName,
          assignedEmployee: notification.metadata?.assignedEmployee,
          source: notification.metadata?.source || 'Unknown'
        });

      case 'follow_up_reminder':
        return emailTemplates.followUpReminder({
          employeeName: notification.recipientName,
          customerName: notification.customerName || 'Unknown',
          reminderTitle: notification.title,
          description: notification.message,
          scheduledTime: notification.scheduledFor ? new Date(notification.scheduledFor).toLocaleString() : 'Now',
          customerEmail: notification.metadata?.customerEmail,
          customerPhone: notification.metadata?.customerPhone
        });

      default:
        console.warn(`⚠️ [NOTIFICATION PROCESSOR] Unknown email template for type: ${notification.type}`);
        return null;
    }
  }

  // Get WhatsApp message based on notification type
  private getWhatsAppMessage(notification: Notification): string | null {
    switch (notification.type) {
      case 'welcome_message':
        return whatsappTemplates.leadWelcome({
          leadName: notification.recipientName,
          assignedEmployee: notification.metadata?.assignedEmployee
        });

      case 'follow_up_reminder':
        return whatsappTemplates.followUpReminder({
          employeeName: notification.recipientName,
          customerName: notification.customerName || 'Unknown',
          reminderTitle: notification.title,
          scheduledTime: notification.scheduledFor ? new Date(notification.scheduledFor).toLocaleString() : 'Now'
        });

      case 'customer_updated':
        return whatsappTemplates.customerFollowUp({
          customerName: notification.recipientName,
          employeeName: notification.metadata?.employeeName || 'Team',
          companyName: notification.metadata?.companyName
        });

      default:
        console.warn(`⚠️ [NOTIFICATION PROCESSOR] Unknown WhatsApp template for type: ${notification.type}`);
        return null;
    }
  }
}

// Create notification helper function
export async function createAndQueueNotification(data: NotificationData): Promise<Notification> {
  try {
    console.log(`📝 [NOTIFICATION QUEUE] Creating notification: ${data.type} for ${data.recipientEmail}`);
    const notification = await createNotification(data);
    console.log(`✅ [NOTIFICATION QUEUE] Notification queued with ID: ${notification.id}`);
    return notification;
  } catch (error) {
    console.error('❌ [NOTIFICATION QUEUE] Failed to create notification:', error);
    throw error;
  }
}

// Specific notification creation functions
export async function createLeadAssignedNotification(data: {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  source: string;
}): Promise<Notification> {
  return createAndQueueNotification({
    type: 'lead_assigned',
    title: `New Lead Assigned: ${data.leadName}`,
    message: `You have been assigned a new lead from ${data.source}`,
    recipientId: data.employeeId,
    recipientEmail: data.employeeEmail,
    recipientName: data.employeeName,
    leadId: data.leadId,
    customerName: data.leadName,
    priority: 'high',
    channels: ['email', 'browser'],
    metadata: {
      leadEmail: data.leadEmail,
      leadPhone: data.leadPhone,
      source: data.source
    }
  });
}

export async function createWelcomeNotification(data: {
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  source: string;
  assignedEmployee?: string;
}): Promise<Notification> {
  return createAndQueueNotification({
    type: 'welcome_message',
    title: `Welcome to KnotSync!`,
    message: `Thank you for your interest in our services`,
    recipientId: 'lead',
    recipientEmail: data.leadEmail,
    recipientName: data.leadName,
    recipientPhone: data.leadPhone,
    priority: 'medium',
    channels: data.leadPhone ? ['email', 'whatsapp'] : ['email'],
    metadata: {
      source: data.source,
      assignedEmployee: data.assignedEmployee
    }
  });
}

export async function createFollowUpReminderNotification(data: {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  customerId: string;
  customerName: string;
  reminderId: string;
  reminderTitle: string;
  reminderDescription?: string;
  scheduledFor: Date;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<Notification> {
  return createAndQueueNotification({
    type: 'follow_up_reminder',
    title: `Follow-up Reminder: ${data.customerName}`,
    message: data.reminderDescription || data.reminderTitle,
    recipientId: data.employeeId,
    recipientEmail: data.employeeEmail,
    recipientName: data.employeeName,
    customerId: data.customerId,
    customerName: data.customerName,
    reminderId: data.reminderId,
    priority: 'high',
    channels: ['email', 'browser'],
    scheduledFor: data.scheduledFor,
    metadata: {
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone
    }
  });
}

// Browser notification helper (client-side)
export function sendBrowserNotification(title: string, body: string, icon = '/favicon.ico'): void {
  if (typeof window === 'undefined') return;

  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon });
        }
      });
    }
  }
}

// Global notification processor instance
export const notificationProcessor = new NotificationProcessor();
