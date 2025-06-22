import { NextRequest, NextResponse } from 'next/server';
import { getDueFollowUpReminders } from '@/lib/actions/followUpActions';

export async function GET() {
  try {
    const reminders = await getDueFollowUpReminders();
    return NextResponse.json({ success: true, reminders });
  } catch (error) {
    console.error('Error fetching due reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch due reminders' },
      { status: 500 }
    );
  }
}
