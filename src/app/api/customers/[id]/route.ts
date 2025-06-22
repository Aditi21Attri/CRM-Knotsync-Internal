import { NextRequest, NextResponse } from 'next/server';
import { updateCustomerAction, deleteCustomerAction } from '@/lib/actions/customerActions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const updatedCustomer = await updateCustomerAction(params.id, updates);
    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteCustomerAction(params.id);
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
    } else {
      return NextResponse.json(
        { success: false, error: result.message || 'Failed to delete customer' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
