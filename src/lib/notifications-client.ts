// Client-safe notification utilities
// This file contains utility functions that can be safely used on the client side

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
export async function sendBrowserNotification({ title, body, icon }: { title: string; body: string; icon?: string }) {
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

// Utility function to validate phone numbers (client-safe version)
export function validatePhoneNumber(phoneNumber: string): { isValid: boolean; cleanNumber: string } {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid length (10+ digits)
  const isValid = cleanNumber.length >= 10;
  
  return { isValid, cleanNumber };
}
