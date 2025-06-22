import { NextRequest, NextResponse } from 'next/server';
import { 
  createFollowUpReminder,
  getFollowUpReminders,
  updateFollowUpReminderStatus,
  deleteFollowUpReminder,
  getDueFollowUpReminders,
  type CreateFollowUpReminderData
} from '@/lib/actions/followUpActions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const customerId = searchParams.get('customerId');
  const getDue = searchParams.get('getDue') === 'true';
  try {
    if (getDue) {
      const dueReminders = await getDueFollowUpReminders();
      return NextResponse.json({ success: true, reminders: dueReminders });
    } else {
      const reminders = await getFollowUpReminders(userId || undefined);
      
      if (customerId) {
        const filtered = reminders.filter(r => r.customerId === customerId);
        return NextResponse.json({ success: true, reminders: filtered });
      }
      
      return NextResponse.json({ success: true, reminders });
    }
  } catch (error) {
    console.error('Failed to fetch follow-up reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow-up reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateFollowUpReminderData = await request.json();
    const newReminder = await createFollowUpReminder(body);
    return NextResponse.json({ success: true, reminder: newReminder }, { status: 201 });
  } catch (error) {
    console.error('Failed to create follow-up reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create follow-up reminder' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reminderId = searchParams.get('id');
    const { status } = await request.json();

    if (!reminderId) {
      return NextResponse.json(
        { error: 'Reminder ID is required' },
        { status: 400 }
      );
    }

    const updatedReminder = await updateFollowUpReminderStatus(reminderId, status);
    
    if (!updatedReminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error('Failed to update follow-up reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update follow-up reminder' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reminderId = searchParams.get('id');

    if (!reminderId) {
      return NextResponse.json(
        { error: 'Reminder ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteFollowUpReminder(reminderId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete follow-up reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete follow-up reminder' },
      { status: 500 }
    );
  }
}
