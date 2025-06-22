import { NextRequest, NextResponse } from 'next/server';
import { deleteEmployeeAction, updateEmployeeAction } from '@/lib/actions/userActions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const updatedUser = await updateEmployeeAction(params.id, updates);
    if (updatedUser) {
      return NextResponse.json({ success: true, user: updatedUser });
    } else {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteEmployeeAction(params.id);
    if (result.success) {
      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } else {
      return NextResponse.json(
        { success: false, error: result.message || 'Failed to delete user' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
