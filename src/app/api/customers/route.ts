import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, addCustomerAction, deleteAllCustomersAction } from '@/lib/actions/customerActions';

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();
    const newCustomer = await addCustomerAction(customerData, customerData.assignedTo, customerData.status);
    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error) {
    console.error('Error adding customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add customer' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const result = await deleteAllCustomersAction();
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} customers`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting all customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customers' },
      { status: 500 }
    );
  }
}
