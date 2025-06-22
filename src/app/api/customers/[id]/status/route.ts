import { NextRequest, NextResponse } from 'next/server';
import { updateCustomerStatusAction } from '@/lib/actions/customerActions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, notes } = await request.json();
    const updatedCustomer = await updateCustomerStatusAction(params.id, status, notes);
    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error('Error updating customer status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer status' },
      { status: 500 }
    );
  }
}
