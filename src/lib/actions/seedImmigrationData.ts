'use server';

import { createImmigrationCustomer, getImmigrationCustomers } from '@/lib/actions/immigrationActions';
import type { ImmigrationCustomer } from '@/lib/types';

export async function seedImmigrationData() {
  try {
    // Check if we already have immigration customers
    const existingCustomers = await getImmigrationCustomers();
    if (existingCustomers.length > 0) {
      return { success: true, message: 'Immigration data already exists', count: existingCustomers.length };
    }

    const sampleImmigrationCustomers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phoneNumber: '+91-9876543210',
        category: 'Immigration Client',
        status: 'hot' as const,
        assignedTo: null,
        notes: 'Software engineer looking for H1B visa',
        
        // Immigration specific fields
        visaType: 'work_visa' as const,
        visaStatus: 'application_submitted' as const,
        destinationCountry: 'US' as const,
        currentCountry: 'IN' as const,
        nationality: 'IN' as const,
        priority: 'high' as const,
        caseComplexity: 'moderate' as const,
        totalFees: 8500,
        paidAmount: 6000,
        remainingAmount: 2500,
        paymentStatus: 'partial' as const,
        preferredLanguage: 'en' as const,
        requiresTranslation: false,
        communicationPreference: 'email' as const,
        documentsReceived: ['passport', 'education-certificates', 'experience-letters'],
        documentsVerified: ['passport', 'education-certificates'],
        complianceScore: 92,
        riskLevel: 'low' as const,
        leadScore: 85,
        conversionProbability: 95,
        customerLifetimeValue: 8500,
        maritalStatus: 'married' as const,
        packageType: 'Premium',
        expectedProcessingTime: 120,
        referralSource: 'Website',
        hasRefusals: false,
        automatedReminders: true,
        createdBy: 'system'
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phoneNumber: '+52-555-123-4567',
        category: 'Immigration Client',
        status: 'neutral' as const,
        assignedTo: null,
        notes: 'Family reunification case',
        
        visaType: 'family_visa' as const,
        visaStatus: 'documents_collection' as const,
        destinationCountry: 'US' as const,
        currentCountry: 'MX' as const,
        nationality: 'MX' as const,
        priority: 'medium' as const,
        caseComplexity: 'simple' as const,
        totalFees: 4500,
        paidAmount: 4500,
        remainingAmount: 0,
        paymentStatus: 'completed' as const,
        preferredLanguage: 'es' as const,
        requiresTranslation: true,
        communicationPreference: 'phone' as const,
        documentsReceived: ['passport', 'marriage-certificate'],
        documentsVerified: ['passport'],
        complianceScore: 78,
        riskLevel: 'medium' as const,
        leadScore: 65,
        conversionProbability: 80,
        customerLifetimeValue: 4500,
        maritalStatus: 'married' as const,
        packageType: 'Basic',
        expectedProcessingTime: 90,
        referralSource: 'Referral',
        hasRefusals: false,
        automatedReminders: true,
        createdBy: 'system'
      },
      {
        name: 'Li Wei',
        email: 'li.wei@email.com',
        phoneNumber: '+86-138-0013-8000',
        category: 'Immigration Client',
        status: 'hot' as const,
        assignedTo: null,
        notes: 'Student visa for Masters program',
        
        visaType: 'student_visa' as const,
        visaStatus: 'application_preparation' as const,
        destinationCountry: 'US' as const,
        currentCountry: 'CN' as const,
        nationality: 'CN' as const,
        priority: 'high' as const,
        caseComplexity: 'simple' as const,
        totalFees: 3200,
        paidAmount: 1600,
        remainingAmount: 1600,
        paymentStatus: 'partial' as const,
        preferredLanguage: 'zh' as const,
        requiresTranslation: true,
        communicationPreference: 'email' as const,
        documentsReceived: ['passport', 'education-certificates', 'financial-statements'],
        documentsVerified: ['passport', 'education-certificates'],
        complianceScore: 95,
        riskLevel: 'low' as const,
        leadScore: 90,
        conversionProbability: 98,
        customerLifetimeValue: 3200,
        maritalStatus: 'single' as const,
        packageType: 'Basic',
        expectedProcessingTime: 60,
        referralSource: 'Education Consultant',
        hasRefusals: false,
        automatedReminders: true,
        createdBy: 'system'
      },
      {
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@email.com',
        phoneNumber: '+971-50-123-4567',
        category: 'Immigration Client',
        status: 'cold' as const,
        assignedTo: null,
        notes: 'Investor visa application',
        
        visaType: 'investor_visa' as const,
        visaStatus: 'initial_consultation' as const,
        destinationCountry: 'CA' as const,
        currentCountry: 'AE' as const,
        nationality: 'EG' as const,
        priority: 'medium' as const,
        caseComplexity: 'complex' as const,
        totalFees: 15000,
        paidAmount: 3000,
        remainingAmount: 12000,
        paymentStatus: 'partial' as const,
        preferredLanguage: 'ar' as const,
        requiresTranslation: true,
        communicationPreference: 'phone' as const,
        documentsReceived: ['passport'],
        documentsVerified: [],
        complianceScore: 60,
        riskLevel: 'high' as const,
        leadScore: 45,
        conversionProbability: 60,
        customerLifetimeValue: 15000,
        maritalStatus: 'married' as const,
        packageType: 'VIP',
        expectedProcessingTime: 180,
        referralSource: 'Advertisement',
        hasRefusals: true,
        automatedReminders: true,
        createdBy: 'system'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phoneNumber: '+44-20-7946-0958',
        category: 'Immigration Client',
        status: 'hot' as const,
        assignedTo: null,
        notes: 'Skilled worker immigration to Australia',
        
        visaType: 'skilled_worker' as const,
        visaStatus: 'interview_scheduled' as const,
        destinationCountry: 'AU' as const,
        currentCountry: 'GB' as const,
        nationality: 'GB' as const,
        priority: 'high' as const,
        caseComplexity: 'moderate' as const,
        totalFees: 7800,
        paidAmount: 7800,
        remainingAmount: 0,
        paymentStatus: 'completed' as const,
        preferredLanguage: 'en' as const,
        requiresTranslation: false,
        communicationPreference: 'email' as const,
        documentsReceived: ['passport', 'education-certificates', 'experience-letters', 'language-test'],
        documentsVerified: ['passport', 'education-certificates', 'experience-letters', 'language-test'],
        complianceScore: 98,
        riskLevel: 'low' as const,
        leadScore: 95,
        conversionProbability: 99,
        customerLifetimeValue: 7800,
        maritalStatus: 'single' as const,
        packageType: 'Premium',
        expectedProcessingTime: 100,
        referralSource: 'Social Media',
        hasRefusals: false,
        automatedReminders: true,
        createdBy: 'system'
      }
    ];

    let createdCount = 0;
    for (const customerData of sampleImmigrationCustomers) {
      try {
        await createImmigrationCustomer(customerData);
        createdCount++;
      } catch (error) {
        console.error(`Failed to create customer ${customerData.name}:`, error);
      }
    }

    return { 
      success: true, 
      message: `Successfully created ${createdCount} immigration customers`, 
      count: createdCount 
    };
  } catch (error) {
    console.error('Failed to seed immigration data:', error);
    return { 
      success: false, 
      message: 'Failed to seed immigration data', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
