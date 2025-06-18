
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { User, UserRole } from '@/lib/types';
import { ObjectId } from 'mongodb';

interface EmployeeCreationData {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    const usersFromDb = await usersCollection.find({}).toArray();
    return usersFromDb.map(user => ({
      ...user,
      id: (user as any)._id.toString(),
    }));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function getEmployees(): Promise<User[]> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    const employeesFromDb = await usersCollection.find({ role: 'employee' }).toArray();
    return employeesFromDb.map(emp => ({
      ...emp,
      id: (emp as any)._id.toString(),
    }));
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    throw new Error('Failed to fetch employees.');
  }
}

export async function addEmployeeAction(employeeData: EmployeeCreationData): Promise<User> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    const newEmployeeData = {
      ...employeeData,
      avatarUrl: employeeData.avatarUrl || `https://placehold.co/100x100/E5EAF7/2962FF?text=${employeeData.name.substring(0,2).toUpperCase()}`,
    };

    const result = await usersCollection.insertOne(newEmployeeData);
    
    if (!result.insertedId) {
      throw new Error('Failed to insert employee');
    }
    
    // Retrieve the inserted document to ensure all fields, including _id, are correctly formed
    const insertedDoc = await usersCollection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
        throw new Error('Failed to retrieve inserted employee');
    }

    const { _id, ...restOfDoc } = insertedDoc;

    return {
      id: _id.toString(),
      ...restOfDoc,
    } as User;

  } catch (error) {
    console.error('Failed to add employee:', error);
    throw new Error('Failed to add employee.');
  }
}

export async function updateEmployeeAction(employeeId: string, updatedData: Partial<EmployeeCreationData>): Promise<User | null> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    const updatePayload: Partial<Omit<User, 'id'>> = { ...updatedData };
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
    return { id: _id.toString(), ...restOfUser } as User;

  } catch (error) {
    console.error('Failed to update employee:', error);
    throw new Error('Failed to update employee.');
  }
}

