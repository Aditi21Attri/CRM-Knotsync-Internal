
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Customer, MappedCustomerData, CustomerStatus, UserRole } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function getCustomers(): Promise<Customer[]> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    const customersFromDb = await customersCollection.find({}).sort({ createdAt: -1 }).toArray(); // Sort by createdAt descending
    return customersFromDb.map(customerDoc => {
      const { _id, ...restOfDoc } = customerDoc;
      return {
        id: _id.toString(),
        ...restOfDoc,
      } as Customer; 
    });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    throw new Error('Failed to fetch customers.');
  }
}

export async function addCustomerAction(
  customerData: MappedCustomerData,
  assignedTo: string | null = null,
  status: CustomerStatus = 'neutral'
): Promise<Customer> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    
    const now = new Date().toISOString();
    const newCustomerDbData: Omit<Customer, 'id'> = {
      name: customerData.name,
      email: customerData.email,
      phoneNumber: customerData.phoneNumber,
      category: customerData.category,
      status: status,
      assignedTo: assignedTo,
      notes: '', // Initialize notes as empty for CSV import
      createdAt: now,
      lastContacted: now,
      ...Object.fromEntries(Object.entries(customerData).filter(([key]) => !['name', 'email', 'phoneNumber', 'category'].includes(key)))
    };
    
    const result = await customersCollection.insertOne(newCustomerDbData);

    if (!result.insertedId) {
      throw new Error('MongoDB insertOne operation completed but did not return an insertedId for customer.');
    }
    
    const insertedDoc = await customersCollection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
        throw new Error('Failed to retrieve the newly inserted customer from the database using its ID.');
    }

    const { _id, ...restOfDoc } = insertedDoc;

    return {
      id: _id.toString(),
      ...restOfDoc,
    } as Customer;

  } catch (error) {
    console.error('Failed to add customer (CSV import):', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to add customer. Details: ${errorMessage}`);
  }
}


export interface ManualAddCustomerFormData {
  name: string;
  email: string;
  phoneNumber?: string;
  category?: string;
}

export async function handleManualAddCustomerAction(
  formData: ManualAddCustomerFormData,
  currentUserId: string,
  currentUserRole: UserRole
): Promise<{ status: 'created' | 'duplicate_updated' | 'error'; customer?: Customer; message?: string }> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    const now = new Date().toISOString();

    // Check for duplicates
    const queryConditions = [];
    if (formData.email) queryConditions.push({ email: formData.email.toLowerCase() });
    if (formData.phoneNumber && formData.phoneNumber.trim() !== "") queryConditions.push({ phoneNumber: formData.phoneNumber });
    
    let existingCustomerDoc: Omit<Customer, 'id'> | null = null;
    if (queryConditions.length > 0) {
        existingCustomerDoc = await customersCollection.findOne({ $or: queryConditions });
    }


    if (existingCustomerDoc) {
      // Duplicate found, update lastContacted
      const updatedResult = await customersCollection.findOneAndUpdate(
        { _id: existingCustomerDoc._id },
        { $set: { lastContacted: now } },
        { returnDocument: 'after' }
      );
      if (!updatedResult) {
         throw new Error('Failed to update existing duplicate customer.');
      }
      const { _id, ...restOfDoc } = updatedResult;
      return { status: 'duplicate_updated', customer: { id: _id.toString(), ...restOfDoc } as Customer };
    } else {
      // No duplicate, create new customer
      const assignedTo = currentUserRole === 'employee' ? currentUserId : null;
      const newCustomerData: Omit<Customer, 'id'> = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        phoneNumber: formData.phoneNumber || '',
        category: formData.category || '',
        status: 'neutral',
        assignedTo: assignedTo,
        notes: '',
        createdAt: now,
        lastContacted: now,
      };
      const result = await customersCollection.insertOne(newCustomerData);
      if (!result.insertedId) {
        throw new Error('MongoDB insertOne failed for manual add.');
      }
      const insertedDoc = await customersCollection.findOne({ _id: result.insertedId });
      if (!insertedDoc) {
          throw new Error('Failed to retrieve manually added customer.');
      }
      const { _id, ...restOfDoc } = insertedDoc;
      return { status: 'created', customer: { id: _id.toString(), ...restOfDoc } as Customer };
    }
  } catch (error) {
    console.error('Error in handleManualAddCustomerAction:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { status: 'error', message };
  }
}


export async function updateCustomerAction(customerId: string, updatedCustomerData: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    
    const updatePayload = { 
        ...updatedCustomerData, 
        lastContacted: new Date().toISOString() 
    };
    
    const result = await customersCollection.findOneAndUpdate(
      { _id: new ObjectId(customerId) },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return null; 
    }
    const { _id, ...restOfCustomer } = result;
    return { id: _id.toString(), ...restOfCustomer } as Customer; 
  } catch (error) {
    console.error('Failed to update customer:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update customer. Details: ${errorMessage}`);
  }
}

export async function assignCustomerAction(customerId: string, employeeId: string | null): Promise<Customer | null> {
   try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    const result = await customersCollection.findOneAndUpdate(
      { _id: new ObjectId(customerId) },
      { $set: { assignedTo: employeeId, lastContacted: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
     if (!result) {
      return null; 
    }
    const { _id, ...restOfCustomer } = result;
    return { id: _id.toString(), ...restOfCustomer } as Customer; 
  } catch (error) {
    console.error('Failed to assign customer:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to assign customer. Details: ${errorMessage}`);
  }
}

export async function updateCustomerStatusAction(customerId: string, status: CustomerStatus, notes?: string): Promise<Customer | null> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    
    const customerDoc = await customersCollection.findOne({ _id: new ObjectId(customerId) });
    if (!customerDoc) return null; 

    const updatePayload: Partial<Omit<Customer, 'id' | 'createdAt'>> = { 
      status, 
      lastContacted: new Date().toISOString() 
    };

    if (notes && notes.trim() !== '') {
      const newNoteEntry = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: ${notes.trim()}`;
      updatePayload.notes = customerDoc.notes && customerDoc.notes.trim() !== ''
        ? `${customerDoc.notes}\n${newNoteEntry}` 
        : newNoteEntry;
    }
    
    const result = await customersCollection.findOneAndUpdate(
      { _id: new ObjectId(customerId) },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null; 
    }
    const { _id, ...restOfCustomer } = result;
    return { id: _id.toString(), ...restOfCustomer } as Customer; 
  } catch (error) {
    console.error('Failed to update customer status:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update customer status. Details: ${errorMessage}`);
  }
}

export async function unassignCustomersByEmployeeId(employeeId: string): Promise<{ success: boolean; modifiedCount: number }> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    
    const result = await customersCollection.updateMany(
      { assignedTo: employeeId },
      { $set: { assignedTo: null, lastContacted: new Date().toISOString() } }
    );
    
    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error(`Failed to unassign customers from employee ${employeeId}:`, error);
    throw new Error(`Failed to unassign customers. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteAllCustomersAction(): Promise<{ success: boolean; deletedCount: number }> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    const result = await customersCollection.deleteMany({}); 
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Failed to delete all customers:', error);
    throw new Error(`Failed to delete all customers. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}
