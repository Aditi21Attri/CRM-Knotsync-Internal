// Server-side only notification processor initialization
let notificationProcessor: any = null;

if (typeof window === 'undefined') {
  // Dynamically import only on server-side to avoid build errors
  import('@/lib/services/notificationProcessor').then(({ notificationProcessor: processor }) => {
    notificationProcessor = processor;
    console.log('🚀 [NOTIFICATION SYSTEM] Initializing notification processor...');
    
    // Start the processor with a 30-second interval
    processor.start(30000);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('🛑 [NOTIFICATION SYSTEM] Shutting down notification processor...');
      processor.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('🛑 [NOTIFICATION SYSTEM] Shutting down notification processor...');
      processor.stop();
      process.exit(0);
    });
  }).catch(error => {
    console.error('❌ [NOTIFICATION SYSTEM] Failed to initialize:', error);
  });
}

export { notificationProcessor };
