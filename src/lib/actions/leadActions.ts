'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Lead, LeadSource, LeadStatus, Customer, CustomerStatus } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { sendLeadNotification } from '@/lib/notifications';
import { getAllEmployees } from './userActions';

export async function getLeads(): Promise<Lead[]> {
  const db = await connectToDatabase();
  const leadsCollection = db.collection<Omit<Lead, 'id'>>('leads');
  const leadsFromDb = await leadsCollection.find({}).sort({ createdAt: -1 }).toArray();
  return leadsFromDb.map(leadDoc => {
    const { _id, ...rest } = leadDoc;
    return { id: _id.toString(), ...rest } as Lead;
  });
}

let lastAssignedIndex = 0;
async function getNextEmployeeRoundRobin(): Promise<{ id: string; name: string; email: string } | null> {
  const employees = await getAllEmployees();
  if (employees.length === 0) return null;
  // For demo, use a simple in-memory index (not persistent)
  const handler = employees[lastAssignedIndex % employees.length];
  lastAssignedIndex++;
  return { id: handler.id, name: handler.name, email: handler.email };
}

export interface AddLeadData {
  name: string;
  email: string;
  phoneNumber?: string;
  message?: string;
  source: LeadSource;
  meta?: any;
  assignedTo?: { id: string; name: string; email: string } | null;
}

export async function addLeadAction(data: AddLeadData): Promise<Lead> {
  const db = await connectToDatabase();
  const leadsCollection = db.collection<Omit<Lead, 'id'>>('leads');
  const now = new Date().toISOString();
  let assignedTo = data.assignedTo;
  if (!assignedTo) {
    assignedTo = await getNextEmployeeRoundRobin();
  }
  const newLead = { ...data, createdAt: now, assignedTo };
  const result = await leadsCollection.insertOne(newLead);
  if (!result.insertedId) throw new Error('Failed to insert lead');
  const insertedDoc = await leadsCollection.findOne({ _id: result.insertedId });
  if (!insertedDoc) throw new Error('Failed to fetch inserted lead');
  const { _id, ...rest } = insertedDoc;
  await sendLeadNotification({ name: newLead.name, email: newLead.email, phoneNumber: newLead.phoneNumber, source: newLead.source, assignedTo: assignedTo || undefined });
  return { id: _id.toString(), ...rest } as Lead;
}

export async function getLeadsAssignedTo(userId: string): Promise<Lead[]> {
  const db = await connectToDatabase();
  const leadsCollection = db.collection<Omit<Lead, 'id'>>('leads');
  const leadsFromDb = await leadsCollection.find({ 'assignedTo.id': userId }).sort({ createdAt: -1 }).toArray();
  return leadsFromDb.map(leadDoc => {
    const { _id, ...rest } = leadDoc;
    return { id: _id.toString(), ...rest } as Lead;
  });
}

export async function updateLeadDetails(leadId: string, updates: { status?: string; notes?: string; expectedRevenue?: string }): Promise<Lead | null> {
  const db = await connectToDatabase();
  const leadsCollection = db.collection<Omit<Lead, 'id'>>('leads');
  const updatePayload: any = { ...updates };
  const result = await leadsCollection.findOneAndUpdate(
    { _id: new ObjectId(leadId) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  if (!result) return null;
  const { _id, ...rest } = result;
  return { id: _id.toString(), ...rest } as Lead;
}

// Convert lead to customer
export async function convertLeadToCustomer(leadId: string, assignedEmployeeId?: string | null): Promise<{ success: boolean; customer?: Customer; error?: string }> {
  try {
    const db = await connectToDatabase();
    const leadsCollection = db.collection<Omit<Lead, 'id'>>('leads');
    const customersCollection = db.collection<Omit<Customer, 'id'>>('customers');
    
    // Get the lead
    const lead = await leadsCollection.findOne({ _id: new ObjectId(leadId) });
    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }
    
    // Check if already converted
    if (lead.status === 'converted') {
      return { success: false, error: 'Lead has already been converted' };
    }
    
    // Create customer from lead
    const now = new Date().toISOString();
    const customerData = {
      name: lead.name,
      email: lead.email,
      phoneNumber: lead.phoneNumber || '',
      category: `From ${lead.source}`,
      status: 'neutral' as CustomerStatus,
      assignedTo: assignedEmployeeId || lead.assignedTo?.id || null,
      notes: lead.notes ? `Converted from lead on ${now}. Original message: ${lead.message || 'No message'}. Notes: ${lead.notes}` : `Converted from lead on ${now}. Original message: ${lead.message || 'No message'}`,
      createdAt: now,
      lastContacted: now,
    };
    
    // Insert customer
    const customerResult = await customersCollection.insertOne(customerData);
    if (!customerResult.insertedId) {
      return { success: false, error: 'Failed to create customer' };
    }
    
    // Update lead status
    await leadsCollection.updateOne(
      { _id: new ObjectId(leadId) },
      { 
        $set: { 
          status: 'converted' as LeadStatus,
          convertedAt: now,
          convertedToCustomerId: customerResult.insertedId.toString()
        }
      }
    );
    
    // Fetch the created customer
    const customerDoc = await customersCollection.findOne({ _id: customerResult.insertedId });
    if (!customerDoc) {
      return { success: false, error: 'Failed to fetch created customer' };
    }
    
    const { _id, ...rest } = customerDoc;
    const customer = { id: _id.toString(), ...rest } as Customer;
    
    return { success: true, customer };
  } catch (error) {
    console.error('Failed to convert lead to customer:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Update lead status (hold, reject, etc.)
export async function updateLeadStatus(leadId: string, status: LeadStatus, notes?: string): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  try {
    const db = await connectToDatabase();
    const leadsCollection = db.collection<Omit<Lead, 'id'>>('leads');
    
    const updateData: any = { status };
    if (notes) {
      updateData.notes = notes;
    }
    
    const result = await leadsCollection.findOneAndUpdate(
      { _id: new ObjectId(leadId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return { success: false, error: 'Lead not found' };
    }
    
    const { _id, ...rest } = result;
    const lead = { id: _id.toString(), ...rest } as Lead;
    
    return { success: true, lead };
  } catch (error) {
    console.error('Failed to update lead status:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Soft delete lead (mark as deleted)
export async function deleteLeadSoft(leadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await connectToDatabase();
    const leadsCollection = db.collection<Omit<Lead, 'id'>>('leads');
    
    const result = await leadsCollection.updateOne(
      { _id: new ObjectId(leadId) },
      { $set: { status: 'deleted' as LeadStatus } }
    );
    
    if (result.matchedCount === 0) {
      return { success: false, error: 'Lead not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Hard delete lead (permanently remove)
export async function deleteLeadHard(leadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await connectToDatabase();
    const leadsCollection = db.collection<Omit<Lead, 'id'>>('leads');
    
    const result = await leadsCollection.deleteOne({ _id: new ObjectId(leadId) });
    
    if (result.deletedCount === 0) {
      return { success: false, error: 'Lead not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return { success: false, error: 'Internal server error' };
  }
}