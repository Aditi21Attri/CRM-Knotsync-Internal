
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Customer, MappedCustomerData, CustomerStatus } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function getCustomers(): Promise<Customer[]> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    const customersFromDb = await customersCollection.find({}).sort({ lastContacted: -1 }).toArray(); // Sort by lastContacted descending
    return customersFromDb.map(customerDoc => {
      const { _id, ...restOfDoc } = customerDoc;
      return {
        id: _id.toString(),
        ...restOfDoc,
      } as Customer; // Ensure correct type casting
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
    
    // Construct the document to be inserted, ensuring all fields of Customer are considered
    const newCustomerDbData: Omit<Customer, 'id'> = {
      name: customerData.name,
      email: customerData.email,
      phoneNumber: customerData.phoneNumber,
      category: customerData.category,
      status: status,
      assignedTo: assignedTo,
      notes: customerData.notes || '', // Ensure notes is always a string
      lastContacted: new Date().toISOString(),
      // Include any other fields from MappedCustomerData that are part of Customer
      ...Object.fromEntries(Object.entries(customerData).filter(([key]) => !['name', 'email', 'phoneNumber', 'category', 'notes'].includes(key)))
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
    } as Customer; // Ensure correct type casting

  } catch (error) {
    console.error('Failed to add customer:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to add customer. Details: ${errorMessage}`);
  }
}

export async function updateCustomerAction(customerId: string, updatedCustomerData: Partial<Omit<Customer, 'id'>>): Promise<Customer | null> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    
    // Ensure lastContacted is updated, and 'id' is not in the $set payload
    const updatePayload = { 
        ...updatedCustomerData, 
        lastContacted: new Date().toISOString() 
    };
     // delete (updatePayload as any).id; // Should not be needed if updatedCustomerData is Partial<Omit<Customer, 'id'>>

    const result = await customersCollection.findOneAndUpdate(
      { _id: new ObjectId(customerId) },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return null; // Customer not found
    }
    const { _id, ...restOfCustomer } = result;
    return { id: _id.toString(), ...restOfCustomer } as Customer; // Ensure correct type casting
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
      return null; // Customer not found
    }
    const { _id, ...restOfCustomer } = result;
    return { id: _id.toString(), ...restOfCustomer } as Customer; // Ensure correct type casting
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
    if (!customerDoc) return null; // Customer not found

    const updatePayload: Partial<Omit<Customer, 'id'>> = { 
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
      return null; // Should not happen if findOne above succeeded, but good practice
    }
    const { _id, ...restOfCustomer } = result;
    return { id: _id.toString(), ...restOfCustomer } as Customer; // Ensure correct type casting
  } catch (error) {
    console.error('Failed to update customer status:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update customer status. Details: ${errorMessage}`);
  }
}

// New action to unassign customers from a given employee
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
