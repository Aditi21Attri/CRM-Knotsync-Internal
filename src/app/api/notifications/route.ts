import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead,
  markAllNotificationsAsRead 
} from '@/lib/actions/notificationActions';

// Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const countOnly = searchParams.get('countOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' }, 
        { status: 400 }
      );
    }

    if (countOnly) {
      const count = await getUnreadNotificationCount(userId);
      return NextResponse.json({ success: true, count });
    }

    const notifications = await getUserNotifications(userId, limit);
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('❌ [API] Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' }, 
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAll } = body;

    if (markAll && userId) {
      const count = await markAllNotificationsAsRead(userId);
      return NextResponse.json({ 
        success: true, 
        message: `Marked ${count} notifications as read` 
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'notificationId is required' }, 
        { status: 400 }
      );
    }

    const success = await markNotificationAsRead(notificationId);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to mark notification as read' }, 
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('❌ [API] Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' }, 
      { status: 500 }
    );
  }
}
