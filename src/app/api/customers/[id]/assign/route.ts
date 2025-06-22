import { NextRequest, NextResponse } from 'next/server';
import { assignCustomerAction } from '@/lib/actions/customerActions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { employeeId } = await request.json();
    const updatedCustomer = await assignCustomerAction(params.id, employeeId);
    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error('Error assigning customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign customer' },
      { status: 500 }
    );
  }
}
