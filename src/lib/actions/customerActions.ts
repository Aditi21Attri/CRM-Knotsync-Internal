
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Customer, MappedCustomerData, CustomerStatus } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function getCustomers(): Promise<Customer[]> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    const customersFromDb = await customersCollection.find({}).toArray();
    return customersFromDb.map(customer => ({
      ...customer,
      id: (customer as any)._id.toString(),
    }));
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
    const customersCollection = db.collection('customers');
    
    const newCustomerData = {
      ...customerData,
      status,
      assignedTo,
      lastContacted: new Date().toISOString(),
      notes: customerData.notes || '',
    };
    
    const result = await customersCollection.insertOne(newCustomerData);

    if (!result.insertedId) {
      throw new Error('Failed to insert customer');
    }
    
    const insertedDoc = await customersCollection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
        throw new Error('Failed to retrieve inserted customer');
    }

    const { _id, ...restOfDoc } = insertedDoc;

    return {
      id: _id.toString(),
      ...restOfDoc,
    } as Customer;

  } catch (error) {
    console.error('Failed to add customer:', error);
    throw new Error('Failed to add customer.');
  }
}

export async function updateCustomerAction(customerId: string, updatedCustomerData: Partial<Customer>): Promise<Customer | null> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    const updatePayload = { 
        ...updatedCustomerData, 
        lastContacted: new Date().toISOString() 
    };
    delete updatePayload.id; 

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
    throw new Error('Failed to update customer.');
  }
}

export async function assignCustomerAction(customerId: string, employeeId: string | null): Promise<Customer | null> {
   try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
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
    throw new Error('Failed to assign customer.');
  }
}

export async function updateCustomerStatusAction(customerId: string, status: CustomerStatus, notes?: string): Promise<Customer | null> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    const customerDoc = await customersCollection.findOne({ _id: new ObjectId(customerId) });
    if (!customerDoc) return null;

    const updatePayload: any = { 
      status, 
      lastContacted: new Date().toISOString() 
    };
    if (notes) {
      const newNoteEntry = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: ${notes}`;
      updatePayload.notes = customerDoc.notes 
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
  } catch (error)
   {
    console.error('Failed to update customer status:', error);
    throw new Error('Failed to update customer status.');
  }
}

