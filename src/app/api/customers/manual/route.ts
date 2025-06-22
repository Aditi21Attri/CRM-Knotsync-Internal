import { NextRequest, NextResponse } from 'next/server';
import { handleManualAddCustomerAction } from '@/lib/actions/customerActions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    // For API, we'll use a default user ID - in a real app this would come from auth
    const currentUserId = 'system';
    const currentUserRole = 'admin';
    
    const result = await handleManualAddCustomerAction(formData, currentUserId, currentUserRole);
    
    if (result.status === 'created' || result.status === 'duplicate_updated') {
      return NextResponse.json({ success: true, customer: result.customer });
    } else {
      return NextResponse.json(
        { success: false, error: result.message || 'Failed to add customer' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error manually adding customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add customer manually' },
      { status: 500 }
    );
  }
}
