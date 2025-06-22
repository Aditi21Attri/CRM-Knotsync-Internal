import { NextRequest, NextResponse } from 'next/server';
import { getUsers as getUsersAction } from '@/lib/actions/userActions';

export async function GET() {
  try {
    const users = await getUsersAction();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
