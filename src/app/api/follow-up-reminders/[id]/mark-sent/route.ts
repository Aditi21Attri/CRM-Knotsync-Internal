import { NextRequest, NextResponse } from 'next/server';
import { markReminderNotificationSent } from '@/lib/actions/followUpActions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await markReminderNotificationSent(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking reminder notification as sent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark reminder notification as sent' },
      { status: 500 }
    );
  }
}
