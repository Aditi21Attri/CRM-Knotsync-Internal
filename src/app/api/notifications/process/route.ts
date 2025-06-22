import { NextRequest, NextResponse } from 'next/server';
import { notificationProcessor } from '@/lib/services/notificationProcessor';

// Import server-side initialization
import '@/lib/startup/notificationInit';

// Process notifications endpoint
export async function POST(request: NextRequest) {
  try {
    await notificationProcessor.processNotifications();
    return NextResponse.json({ success: true, message: 'Notifications processed successfully' });
  } catch (error) {
    console.error('❌ [API] Error processing notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process notifications' }, 
      { status: 500 }
    );
  }
}

// Start notification processor endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const intervalMs = body.intervalMs || 30000; // Default 30 seconds
    
    notificationProcessor.start(intervalMs);
    
    return NextResponse.json({ 
      success: true, 
      message: `Notification processor started with ${intervalMs}ms interval` 
    });
  } catch (error) {
    console.error('❌ [API] Error starting notification processor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start notification processor' }, 
      { status: 500 }
    );
  }
}

// Stop notification processor endpoint
export async function DELETE(request: NextRequest) {
  try {
    notificationProcessor.stop();
    return NextResponse.json({ success: true, message: 'Notification processor stopped' });
  } catch (error) {
    console.error('❌ [API] Error stopping notification processor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to stop notification processor' }, 
      { status: 500 }
    );
  }
}
