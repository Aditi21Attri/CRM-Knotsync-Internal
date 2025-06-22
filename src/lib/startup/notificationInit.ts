// Server-side notification processor initialization
// This file should only be imported in server-side code

import { notificationProcessor } from '@/lib/services/notificationProcessor';

// Initialize the notification processor
export function initializeNotificationSystem() {
  console.log('🚀 [NOTIFICATION SYSTEM] Starting notification processor...');
  
  // Start the processor with a 30-second interval
  notificationProcessor.start(30000);
  
  // Handle graceful shutdown
  const cleanup = () => {
    console.log('🛑 [NOTIFICATION SYSTEM] Shutting down notification processor...');
    notificationProcessor.stop();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
  
  return notificationProcessor;
}

// Auto-initialize if this file is loaded
if (typeof window === 'undefined') {
  initializeNotificationSystem();
}
