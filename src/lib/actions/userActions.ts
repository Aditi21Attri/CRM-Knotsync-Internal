
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { User, UserRole } from '@/lib/types';
import { ObjectId } from 'mongodb';

export interface EmployeeData {
  name: string;
  email: string;
  role: UserRole;
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
        password: restOfDoc.password,
        role: restOfDoc.role,
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
    // Fetch all users and then filter for employees client-side or ensure role is strictly 'employee' in DB query if preferred
    const employeesFromDb = await usersCollection.find({ role: 'employee' }).toArray();

    return employeesFromDb.map(empDoc => {
       const { _id, ...restOfDoc } = empDoc;
       const employee: User = {
        id: _id.toString(),
        name: restOfDoc.name,
        email: restOfDoc.email,
        password: restOfDoc.password,
        role: restOfDoc.role,
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


export async function addEmployeeAction(employeeData: Required<Pick<EmployeeData, 'name' | 'email' | 'role' | 'password'>> & Partial<EmployeeData>): Promise<User> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');

    const existingUser = await usersCollection.findOne({ email: employeeData.email });
    if (existingUser) {
      throw new Error('An employee with this email already exists.');
    }

    const newEmployeeDbData: Omit<User, 'id'> = {
      name: employeeData.name,
      email: employeeData.email,
      password: employeeData.password,
      role: employeeData.role,
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
    const finalUser: User = {
      id: _id.toString(),
      name: restOfDoc.name,
      email: restOfDoc.email,
      password: restOfDoc.password,
      role: restOfDoc.role,
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

export async function updateEmployeeAction(employeeId: string, updatedData: Partial<Omit<EmployeeData, 'password'>>): Promise<User | null> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    const updatePayload: Partial<Omit<User, 'id' | 'password'>> = { ...updatedData };
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
      password: restOfUser.password,
      role: restOfUser.role,
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

export async function authenticateUser(email: string, passwordAttempt: string): Promise<User | null> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    const userDoc = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!userDoc) {
      return null; 
    }

    if (userDoc.password === passwordAttempt) {
      const { _id, ...restOfDoc } = userDoc;
      const user: User = {
        id: _id.toString(),
        name: restOfDoc.name,
        email: restOfDoc.email,
        role: restOfDoc.role,
        avatarUrl: restOfDoc.avatarUrl,
        specializedRegion: restOfDoc.specializedRegion,
      };
      return user;
    }

    return null; 
  } catch (error) {
    console.error('Error during user authentication:', error);
    throw new Error('Authentication failed due to a server error.');
  }
}
