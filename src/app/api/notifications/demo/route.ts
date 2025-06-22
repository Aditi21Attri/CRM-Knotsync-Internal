import { NextRequest, NextResponse } from 'next/server';
import { createAndQueueNotification } from '@/lib/services/notificationProcessor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, type = 'system_alert' } = body;

    if (!userId || !userName || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'userId, userName, and userEmail are required' }, 
        { status: 400 }
      );
    }

    // Create a demo notification
    const notification = await createAndQueueNotification({
      type,
      title: `Demo Notification - ${type.replace('_', ' ').toUpperCase()}`,
      message: `This is a test notification for ${userName}. The notification system is working correctly!`,
      recipientId: userId,
      recipientEmail: userEmail,
      recipientName: userName,
      priority: 'medium',
      channels: ['email', 'browser'],
      metadata: {
        demo: true,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Demo notification created successfully',
      notificationId: notification.id
    });
  } catch (error) {
    console.error('❌ [API] Error creating demo notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create demo notification' }, 
      { status: 500 }
    );
  }
}
