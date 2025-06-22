'use server';

import { connectToDatabase, getObjectId } from '@/lib/mongodb-server';
import type { 
  ImmigrationCustomer, 
  VisaType, 
  VisaStatus, 
  Priority, 
  CaseComplexity,
  CountryCode,
  Language,
  ComplianceIssue,
  PolicyUpdate,
  ClientPortalAccess,
  PortalMessage,
  Document,
  ImmigrationTimeline
} from '@/lib/types';

// Convert regular customer to immigration customer
export async function convertToImmigrationCustomer(
  customerId: string,
  immigrationData: Partial<ImmigrationCustomer>
): Promise<ImmigrationCustomer | null> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    const updateData = {
      ...immigrationData,
      lastContacted: new Date().toISOString(),
      isImmigrationCustomer: true
    };
    
    const result = await customersCollection.findOneAndUpdate(
      { _id: new (await getObjectId())(customerId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) return null;
    
    const { _id, ...restOfDoc } = result;
    return { id: _id.toString(), ...restOfDoc } as ImmigrationCustomer;
  } catch (error) {
    console.error('Failed to convert customer to immigration customer:', error);
    throw new Error('Failed to convert customer to immigration customer');
  }
}

// Get all immigration customers
export async function getImmigrationCustomers(): Promise<ImmigrationCustomer[]> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    const immigrationCustomersFromDb = await customersCollection
      .find({ isImmigrationCustomer: true })
      .sort({ createdAt: -1 })
      .toArray();
      
    return immigrationCustomersFromDb.map((customerDoc: any) => {
      const { _id, ...restOfDoc } = customerDoc;
      return {
        id: _id.toString(),
        ...restOfDoc,
      } as ImmigrationCustomer;
    });
  } catch (error) {
    console.error('Failed to fetch immigration customers:', error);
    throw new Error('Failed to fetch immigration customers');
  }
}

// Create new immigration customer
export async function createImmigrationCustomer(
  customerData: Omit<ImmigrationCustomer, 'id' | 'createdAt'>
): Promise<ImmigrationCustomer> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    const now = new Date().toISOString();
    const newCustomerData = {
      ...customerData,
      createdAt: now,
      lastContacted: now,
      isImmigrationCustomer: true,
      // Set defaults for required fields if not provided
      complianceScore: customerData.complianceScore || 85,
      leadScore: customerData.leadScore || 50,
      conversionProbability: customerData.conversionProbability || 50,
      customerLifetimeValue: customerData.customerLifetimeValue || 0,
      documentsReceived: customerData.documentsReceived || [],
      documentsVerified: customerData.documentsVerified || [],
      hasRefusals: customerData.hasRefusals || false,
      automatedReminders: customerData.automatedReminders !== false,
    };
    
    const result = await customersCollection.insertOne(newCustomerData);
    
    if (!result.insertedId) {
      throw new Error('Failed to create immigration customer');
    }
    
    const insertedDoc = await customersCollection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
      throw new Error('Failed to retrieve newly created immigration customer');
    }
    
    const { _id, ...restOfDoc } = insertedDoc;
    return { id: _id.toString(), ...restOfDoc } as ImmigrationCustomer;
  } catch (error) {
    console.error('Failed to create immigration customer:', error);
    throw new Error('Failed to create immigration customer');
  }
}

// Update immigration customer
export async function updateImmigrationCustomer(
  customerId: string,
  updateData: Partial<Omit<ImmigrationCustomer, 'id' | 'createdAt'>>
): Promise<ImmigrationCustomer | null> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    const payload = {
      ...updateData,
      lastContacted: new Date().toISOString()
    };
    
    const result = await customersCollection.findOneAndUpdate(
      { _id: new (await getObjectId())(customerId) },
      { $set: payload },
      { returnDocument: 'after' }
    );
    
    if (!result) return null;
    
    const { _id, ...restOfDoc } = result;
    return { id: _id.toString(), ...restOfDoc } as ImmigrationCustomer;
  } catch (error) {
    console.error('Failed to update immigration customer:', error);
    throw new Error('Failed to update immigration customer');
  }
}

// Client Portal Access Management
export async function createClientPortalAccess(
  customerId: string,
  email: string,
  permissions: string[]
): Promise<ClientPortalAccess> {
  try {
    const db = await connectToDatabase();
    const portalAccessCollection = db.collection('client_portal_access');
    
    const accessData = {
      customerId,
      email: email.toLowerCase(),
      accessToken: generateAccessToken(),
      isActive: true,
      permissions,
      language: 'en' as Language,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    
    const result = await portalAccessCollection.insertOne(accessData);
    
    if (!result.insertedId) {
      throw new Error('Failed to create client portal access');
    }
    
    const insertedDoc = await portalAccessCollection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
      throw new Error('Failed to retrieve newly created portal access');
    }
    
    const { _id, ...restOfDoc } = insertedDoc;
    return { id: _id.toString(), ...restOfDoc } as ClientPortalAccess;
  } catch (error) {
    console.error('Failed to create client portal access:', error);
    throw new Error('Failed to create client portal access');
  }
}

// Get client portal access by customer ID
export async function getClientPortalAccess(customerId: string): Promise<ClientPortalAccess | null> {
  try {
    const db = await connectToDatabase();
    const portalAccessCollection = db.collection('client_portal_access');
    
    const accessDoc = await portalAccessCollection.findOne({ customerId, isActive: true });
    
    if (!accessDoc) return null;
    
    const { _id, ...restOfDoc } = accessDoc;
    return { id: _id.toString(), ...restOfDoc } as ClientPortalAccess;
  } catch (error) {
    console.error('Failed to get client portal access:', error);
    throw new Error('Failed to get client portal access');
  }
}

// Portal Messages
export async function createPortalMessage(
  customerId: string,
  senderId: string,
  senderType: 'customer' | 'employee' | 'system',
  message: string,
  attachments?: string[]
): Promise<PortalMessage> {
  try {
    const db = await connectToDatabase();
    const messagesCollection = db.collection('portal_messages');
    
    const messageData = {
      customerId,
      senderId,
      senderType,
      message,
      attachments: attachments || [],
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    const result = await messagesCollection.insertOne(messageData);
    
    if (!result.insertedId) {
      throw new Error('Failed to create portal message');
    }
    
    const insertedDoc = await messagesCollection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
      throw new Error('Failed to retrieve newly created message');
    }
    
    const { _id, ...restOfDoc } = insertedDoc;
    return { id: _id.toString(), ...restOfDoc } as PortalMessage;
  } catch (error) {
    console.error('Failed to create portal message:', error);
    throw new Error('Failed to create portal message');
  }
}

// Get portal messages for customer
export async function getPortalMessages(customerId: string): Promise<PortalMessage[]> {
  try {
    const db = await connectToDatabase();
    const messagesCollection = db.collection('portal_messages');
    
    const messages = await messagesCollection
      .find({ customerId })
      .sort({ createdAt: -1 })
      .toArray();
      
    return messages.map((messageDoc: any) => {
      const { _id, ...restOfDoc } = messageDoc;
      return { id: _id.toString(), ...restOfDoc } as PortalMessage;
    });
  } catch (error) {
    console.error('Failed to get portal messages:', error);
    throw new Error('Failed to get portal messages');
  }
}

// Update compliance score
export async function updateComplianceScore(
  customerId: string,
  score: number,
  issues: ComplianceIssue[]
): Promise<void> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    await customersCollection.updateOne(
      { _id: new (await getObjectId())(customerId) },
      { 
        $set: { 
          complianceScore: score,
          complianceIssues: issues,
          lastComplianceCheck: new Date().toISOString()
        }
      }
    );
  } catch (error) {
    console.error('Failed to update compliance score:', error);
    throw new Error('Failed to update compliance score');
  }
}

// Document management
export async function uploadDocument(
  customerId: string,
  documentData: Omit<Document, 'id' | 'uploadedAt'>
): Promise<Document> {
  try {
    const db = await connectToDatabase();
    const documentsCollection = db.collection('immigration_documents');
    
    const docData = {
      ...documentData,
      customerId,
      uploadedAt: new Date().toISOString()
    };
    
    const result = await documentsCollection.insertOne(docData);
    
    if (!result.insertedId) {
      throw new Error('Failed to upload document');
    }
    
    const insertedDoc = await documentsCollection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
      throw new Error('Failed to retrieve uploaded document');
    }
    
    const { _id, ...restOfDoc } = insertedDoc;
    return { id: _id.toString(), ...restOfDoc } as Document;
  } catch (error) {
    console.error('Failed to upload document:', error);
    throw new Error('Failed to upload document');
  }
}

// Get documents for customer
export async function getCustomerDocuments(customerId: string): Promise<Document[]> {
  try {
    const db = await connectToDatabase();
    const documentsCollection = db.collection('immigration_documents');
    
    const documents = await documentsCollection
      .find({ customerId })
      .sort({ uploadedAt: -1 })
      .toArray();
      
    return documents.map((docDoc: any) => {
      const { _id, ...restOfDoc } = docDoc;
      return { id: _id.toString(), ...restOfDoc } as Document;
    });
  } catch (error) {
    console.error('Failed to get customer documents:', error);
    throw new Error('Failed to get customer documents');
  }
}

// Timeline management
export async function addTimelineEvent(
  customerId: string,
  event: Omit<ImmigrationTimeline, 'id' | 'createdAt'>
): Promise<ImmigrationTimeline> {
  try {
    const db = await connectToDatabase();
    const timelineCollection = db.collection('immigration_timeline');
    
    const eventData = {
      ...event,
      customerId,
      createdAt: new Date().toISOString()
    };
    
    const result = await timelineCollection.insertOne(eventData);
    
    if (!result.insertedId) {
      throw new Error('Failed to add timeline event');
    }
    
    const insertedDoc = await timelineCollection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
      throw new Error('Failed to retrieve timeline event');
    }
    
    const { _id, ...restOfDoc } = insertedDoc;
    return { id: _id.toString(), ...restOfDoc } as ImmigrationTimeline;
  } catch (error) {
    console.error('Failed to add timeline event:', error);
    throw new Error('Failed to add timeline event');
  }
}

// Get timeline for customer
export async function getCustomerTimeline(customerId: string): Promise<ImmigrationTimeline[]> {
  try {
    const db = await connectToDatabase();
    const timelineCollection = db.collection('immigration_timeline');
    
    const timeline = await timelineCollection
      .find({ customerId })
      .sort({ date: -1 })
      .toArray();
      
    return timeline.map((timelineDoc: any) => {
      const { _id, ...restOfDoc } = timelineDoc;
      return { id: _id.toString(), ...restOfDoc } as ImmigrationTimeline;
    });
  } catch (error) {
    console.error('Failed to get customer timeline:', error);
    throw new Error('Failed to get customer timeline');
  }
}

// Delete immigration customer
export async function deleteImmigrationCustomer(customerId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    const result = await customersCollection.deleteOne({ _id: new (await getObjectId())(customerId) });
    
    if (result.deletedCount === 0) {
      return { success: false, message: 'Immigration customer not found.' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete immigration customer:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to delete immigration customer. Details: ${errorMessage}` };
  }
}

// Delete all immigration customers
export async function deleteAllImmigrationCustomers(): Promise<{ success: boolean; deletedCount: number }> {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    const result = await customersCollection.deleteMany({ isImmigrationCustomer: true }); 
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Failed to delete all immigration customers:', error);
    throw new Error(`Failed to delete all immigration customers. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to generate access token
function generateAccessToken(): string {
  return Math.random().toString(36).substring(2) + 
         Math.random().toString(36).substring(2) + 
         Date.now().toString(36);
}

// Analytics functions
export async function getImmigrationAnalytics() {
  try {
    const db = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    const pipeline = [
      { $match: { isImmigrationCustomer: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalFees' },
          totalPaid: { $sum: '$paidAmount' },
          totalRemaining: { $sum: '$remainingAmount' },
          avgComplianceScore: { $avg: '$complianceScore' },
          totalCustomers: { $sum: 1 },
          visaTypeBreakdown: {
            $push: {
              visaType: '$visaType',
              fees: '$totalFees',
              status: '$visaStatus'
            }
          }
        }
      }
    ];
    
    const result = await customersCollection.aggregate(pipeline).toArray();
    return result[0] || {
      totalRevenue: 0,
      totalPaid: 0,
      totalRemaining: 0,
      avgComplianceScore: 0,
      totalCustomers: 0,
      visaTypeBreakdown: []
    };
  } catch (error) {
    console.error('Failed to get immigration analytics:', error);
    throw new Error('Failed to get immigration analytics');
  }
}
