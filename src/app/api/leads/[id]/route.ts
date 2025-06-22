import { NextRequest, NextResponse } from 'next/server';
import { updateLeadDetails, deleteLeadHard, deleteLeadSoft } from '@/lib/actions/leadActions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();    const lead = await updateLeadDetails(params.id, updates);
    if (lead) {
      return NextResponse.json({ success: true, lead });
    } else {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const soft = url.searchParams.get('soft') === 'true';
    
    const result = soft 
      ? await deleteLeadSoft(params.id)
      : await deleteLeadHard(params.id);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Lead ${soft ? 'soft' : 'hard'} deleted successfully` 
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete lead' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
