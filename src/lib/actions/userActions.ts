
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { User, UserRole, UserStatus } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { unassignCustomersByEmployeeId } from './customerActions';


export interface EmployeeData {
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  avatarUrl?: string;
  password?: string; 
  specializedRegion?: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    const usersFromDb = await usersCollection.find({}).toArray();
    
    return usersFromDb.map(userDoc => {
      const { _id, ...restOfDoc } = userDoc;
      const user: User = {
        id: _id.toString(),
        name: restOfDoc.name,
        email: restOfDoc.email,
        password: restOfDoc.password, // Still map password if present, though not sent to client via AuthContext
        role: restOfDoc.role,
        status: restOfDoc.status || 'active', // Default to active
        avatarUrl: restOfDoc.avatarUrl,
        specializedRegion: restOfDoc.specializedRegion,
      };
      return user;
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function getEmployees(): Promise<User[]> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    // Ensure we only fetch users explicitly marked with role 'employee'
    const employeesFromDb = await usersCollection.find({ role: 'employee' }).toArray();

    return employeesFromDb.map(empDoc => {
       const { _id, ...restOfDoc } = empDoc;
       const employee: User = {
        id: _id.toString(),
        name: restOfDoc.name,
        email: restOfDoc.email,
        password: restOfDoc.password,
        role: restOfDoc.role as 'employee', // Cast as employee role
        status: restOfDoc.status || 'active',
        avatarUrl: restOfDoc.avatarUrl,
        specializedRegion: restOfDoc.specializedRegion,
      };
      return employee;
    });
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    throw new Error('Failed to fetch employees.');
  }
}


export async function addEmployeeAction(employeeData: Required<Pick<EmployeeData, 'name' | 'email' | 'role' | 'password'>> & Partial<Omit<EmployeeData, 'name' | 'email' | 'role' | 'password' | 'status'>>): Promise<User> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');

    const existingUser = await usersCollection.findOne({ email: employeeData.email.toLowerCase() });
    if (existingUser) {
      throw new Error('An employee with this email already exists.');
    }

    const newEmployeeDbData: Omit<User, 'id'> = {
      name: employeeData.name,
      email: employeeData.email.toLowerCase(),
      password: employeeData.password, // Store the provided password
      role: employeeData.role,
      status: 'active', // New employees are active by default
      avatarUrl: employeeData.avatarUrl || `https://placehold.co/100x100/E5EAF7/2962FF?text=${employeeData.name.substring(0,2).toUpperCase()}`,
      specializedRegion: employeeData.specializedRegion || undefined,
    };

    const result = await usersCollection.insertOne(newEmployeeDbData);

    if (!result.insertedId) {
      throw new Error('MongoDB insertOne operation completed but did not return an insertedId.');
    }
    
    const insertedDoc = await usersCollection.findOne({ _id: result.insertedId });

    if (!insertedDoc) {
        throw new Error('Failed to retrieve the newly inserted employee from the database using its ID.');
    }
    
    const { _id, ...restOfDoc } = insertedDoc;
    // Construct the User object to be returned, omitting password for security if it were hashed
    const finalUser: User = {
      id: _id.toString(),
      name: restOfDoc.name,
      email: restOfDoc.email,
      // Do NOT return password to the client, even if it's just mapped from DB here.
      // The AuthContext's currentUser should not have password.
      role: restOfDoc.role,
      status: restOfDoc.status, // Should be 'active'
      avatarUrl: restOfDoc.avatarUrl,
      specializedRegion: restOfDoc.specializedRegion,
    };
    return finalUser;

  } catch (error) {
    console.error('Full error in addEmployeeAction:', error); 
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to add employee. Details: ${errorMessage}`);
  }
}

export async function updateEmployeeAction(employeeId: string, updatedData: Partial<Omit<EmployeeData, 'password' | 'status'>>): Promise<User | null> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    // Ensure email, if provided, is lowercased for consistency
    const updatePayload: Partial<Omit<User, 'id' | 'password' | 'status'>> = { ...updatedData };
    if (updatedData.email) {
        updatePayload.email = updatedData.email.toLowerCase();
    }
    if (updatedData.name && !updatedData.avatarUrl) { 
        updatePayload.avatarUrl = `https://placehold.co/100x100/E5EAF7/2962FF?text=${updatedData.name.substring(0,2).toUpperCase()}`;
    }
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(employeeId) },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return null; 
    }
    
    const { _id, ...restOfUser } = result;
    const updatedUser: User = {
      id: _id.toString(),
      name: restOfUser.name,
      email: restOfUser.email,
      role: restOfUser.role,
      status: restOfUser.status || 'active', // Ensure status is present
      avatarUrl: restOfUser.avatarUrl,
      specializedRegion: restOfUser.specializedRegion,
    };
    return updatedUser;

  } catch (error) {
    console.error('Full error in updateEmployeeAction:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update employee. Details: ${errorMessage}`);
  }
}

export async function deleteEmployeeAction(employeeId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    // Before deleting, unassign customers from this employee
    await unassignCustomersByEmployeeId(employeeId);

    const result = await usersCollection.deleteOne({ _id: new ObjectId(employeeId) });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Employee not found.' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting employee:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to delete employee: ${errorMessage}` };
  }
}

export async function toggleEmployeeSuspensionAction(employeeId: string): Promise<User | null> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');

    const employee = await usersCollection.findOne({ _id: new ObjectId(employeeId) });
    if (!employee) {
      return null;
    }

    const newStatus: UserStatus = employee.status === 'active' ? 'suspended' : 'active';

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(employeeId) },
      { $set: { status: newStatus } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }
    const { _id, ...restOfUser } = result;
    // Ensure the returned User object has all necessary fields and correct types
    return { 
      id: _id.toString(), 
      name: restOfUser.name,
      email: restOfUser.email,
      role: restOfUser.role,
      status: restOfUser.status, // This is the newly updated status
      avatarUrl: restOfUser.avatarUrl,
      specializedRegion: restOfUser.specializedRegion,
    } as User;
  } catch (error) {
    console.error('Error toggling employee suspension:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to toggle employee suspension: ${errorMessage}`);
  }
}

export async function authenticateUser(email: string, passwordAttempt: string): Promise<User | null> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    const userDoc = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!userDoc) {
      return null; // User not found
    }

    if (userDoc.status === 'suspended') {
      return null; // Account suspended, authentication fails
    }

    // IMPORTANT: Ensure password field exists on userDoc before comparing
    if (userDoc.password && userDoc.password === passwordAttempt) {
      const { _id, ...restOfDoc } = userDoc;
      // Construct User object for AuthContext, EXCLUDING password
      const user: User = {
        id: _id.toString(),
        name: restOfDoc.name,
        email: restOfDoc.email,
        role: restOfDoc.role,
        status: restOfDoc.status || 'active', // Default to active if status somehow missing
        avatarUrl: restOfDoc.avatarUrl,
        specializedRegion: restOfDoc.specializedRegion,
      };
      return user; // Authentication successful
    }

    return null; // Password incorrect or missing
  } catch (error) {
    console.error('Error during user authentication:', error);
    // Do not expose detailed error messages to the client from here
    throw new Error('Authentication failed due to a server error.');
  }
}

