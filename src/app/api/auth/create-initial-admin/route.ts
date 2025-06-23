import { NextRequest, NextResponse } from 'next/server';
import { createInitialAdminAction } from '@/lib/actions/userActions';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const user = await createInitialAdminAction({ name, email, password });
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Create initial admin error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create admin';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
