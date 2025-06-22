// Enhanced notifications system for CRM - Database-backed version
import { 
  createLeadAssignedNotification, 
  createWelcomeNotification, 
  createFollowUpReminderNotification,
  sendBrowserNotification as sendBrowserNotificationUtil
} from '@/lib/services/notificationProcessor';

export async function sendLeadNotification({ 
  name, 
  email, 
  phoneNumber, 
  source, 
  assignedTo 
}: { 
  name: string; 
  email: string; 
  phoneNumber?: string; 
  source: string; 
  assignedTo?: { id: string; name: string; email: string } 
}) {
  console.log(`🔔 NEW LEAD NOTIFICATION - Processing lead: ${name}`);
  
  try {
    // Create employee notification if assigned
    if (assignedTo) {
      await createLeadAssignedNotification({
        employeeId: assignedTo.id,
        employeeName: assignedTo.name,
        employeeEmail: assignedTo.email,
        leadId: 'temp-lead-id', // Will be replaced with actual lead ID
        leadName: name,
        leadEmail: email,
        leadPhone: phoneNumber,
        source
      });
    }
    
    // Create welcome notification for the lead
    await createWelcomeNotification({
      leadName: name,
      leadEmail: email,
      leadPhone: phoneNumber,
      source,
      assignedEmployee: assignedTo?.name
    });
    
    console.log(`✅ Lead notification queued successfully for ${name}`);
  } catch (error) {
    console.error(`❌ Failed to queue lead notification for ${name}:`, error);
  }
}

// Follow-up reminder notifications
export async function sendFollowUpReminderNotification({ 
  reminder, 
  userEmail, 
  userName 
}: { 
  reminder: any; 
  userEmail: string; 
  userName: string; 
}) {
  console.log(`🔔 FOLLOW-UP REMINDER - Processing reminder for ${userName}`);
  
  try {
    // Create follow-up reminder notification
    await createFollowUpReminderNotification({
      employeeId: reminder.createdBy || 'unknown',
      employeeName: userName,
      employeeEmail: userEmail,
      customerId: reminder.customerId,
      customerName: reminder.customerName,
      reminderId: reminder.id,
      reminderTitle: reminder.title,
      reminderDescription: reminder.description,
      scheduledFor: new Date(reminder.scheduledFor),
      customerEmail: reminder.customerEmail,
      customerPhone: reminder.customerPhoneNumber
    });
    
    // Send immediate browser notification if supported
    sendBrowserNotificationUtil(
      `Follow-up Reminder: ${reminder.customerName}`,
      `${reminder.title} - Scheduled for ${new Date(reminder.scheduledFor).toLocaleString()}`
    );
    
    console.log(`✅ Follow-up reminder queued successfully for ${userName}`);
  } catch (error) {
    console.error(`❌ Failed to queue follow-up reminder for ${userName}:`, error);
  }
}

// Utility function to validate and clean phone numbers
export function validatePhoneNumber(phoneNumber: string): { isValid: boolean; cleanNumber: string } {
  // Remove all non-numeric characters except +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Check if it's a valid length (at least 10 digits)
  const isValid = cleanNumber.length >= 10;
  
  return { isValid, cleanNumber };
}

// Utility function to format notification timestamps
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

// Browser notification function (for immediate notifications)
async function sendBrowserNotification({ title, body, icon }: { title: string; body: string; icon?: string }) {
  // Check if browser supports notifications
  if (typeof window !== 'undefined' && 'Notification' in window) {
    // Request permission if not already granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    // Send notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: 'crm-notification', // This prevents duplicate notifications
      });
      console.log(`🔔 [BROWSER NOTIFICATION] ${title}: ${body}`);
    } else {
      console.log(`🔔 [BROWSER NOTIFICATION] Permission denied for: ${title}`);
    }
  } else {
    console.log(`🔔 [BROWSER NOTIFICATION] Not supported: ${title}`);
  }
}