import { NextRequest, NextResponse } from 'next/server';
import { getUsers as getUsersAction, getEmployees as getEmployeesAction, addEmployeeAction } from '@/lib/actions/userActions';

export async function GET() {
  try {
    const employees = await getEmployeesAction();
    return NextResponse.json({ success: true, employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const employeeData = await request.json();
    const newEmployee = await addEmployeeAction(employeeData);
    return NextResponse.json({ success: true, employee: newEmployee });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add employee' },
      { status: 500 }
    );
  }
}
