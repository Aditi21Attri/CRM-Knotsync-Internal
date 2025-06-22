import { NextRequest, NextResponse } from 'next/server';
import { getLeads, addLeadAction } from '@/lib/actions/leadActions';

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();
    const newLead = await addLeadAction(leadData);
    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    console.error('Error adding lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add lead' },
      { status: 500 }
    );
  }
}
