'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Lead, LeadSource } from '@/lib/types';
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
  await sendLeadNotification({ name: newLead.name, email: newLead.email, phoneNumber: newLead.phoneNumber, source: newLead.source, assignedTo });
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