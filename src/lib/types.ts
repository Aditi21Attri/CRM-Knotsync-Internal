export type UserRole = 'admin' | 'employee';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored for mock authentication. In real app, use passwordHash.
  role: UserRole;
  status?: UserStatus; // Optional for existing users, will default to 'active'
  avatarUrl?: string;
  specializedRegion?: string; // e.g., "USA", "Australia", "UK"
  // assignedCustomerIds: string[]; // This is an alternative data model.
  // Currently, customer assignment is handled by Customer.assignedTo (employee ID).
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export type CustomerStatus = 'hot' | 'cold' | 'neutral';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  category?: string; // Generic category/tag, e.g., 'USA', 'UK', 'Tech Lead'. Used for regional matching.
  status: CustomerStatus;
  assignedTo: string | null; // Employee ID
  notes?: string;
  createdAt: string; // ISO date string
  lastContacted?: string; // ISO date string
  // Additional generic fields from Excel can be added here or handled dynamically
  [key: string]: any; 
}

export interface Employee extends User {
  // Employee specific fields, if any, beyond what User provides.
  // For now, it's structurally same as User but with a specific role.
  role: 'employee';
}

// Data structure for mock Excel rows
export interface ExcelRowData {
  [key: string]: string | number;
}

// Represents the data structure after admin has mapped Excel columns
// It's essentially what a new Customer object would look like before ID, status, assignment.
export interface MappedCustomerData extends Omit<Customer, 'id' | 'status' | 'assignedTo' | 'lastContacted' | 'createdAt' | 'notes'> {
  // Fields are dynamically determined by Excel import and mapping
}

export type LeadSource = 'website' | 'instagram' | 'facebook' | 'google' | 'linkedin' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'on_hold' | 'rejected' | 'deleted';

// Follow-up reminder types
export type FollowUpStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';

export interface FollowUpReminder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  createdBy: string; // User ID who created the reminder
  createdByName: string;
  title: string;
  description?: string;
  scheduledFor: string; // ISO date string
  status: FollowUpStatus;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  completedAt?: string; // ISO date string when marked as completed
  notificationSent?: boolean;
  notificationSentAt?: string; // ISO date string when notification was sent
  priority?: 'low' | 'medium' | 'high';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  message?: string;
  source: LeadSource;
  createdAt: string; // ISO date string
  meta?: any; // For extra data from ad platforms
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  status?: LeadStatus;
  notes?: string;
  expectedRevenue?: string;
  convertedAt?: string; // ISO date string when converted to customer
  convertedToCustomerId?: string; // Customer ID if converted
}

// Notification system types
export type NotificationType = 'lead_assigned' | 'follow_up_reminder' | 'lead_converted' | 'customer_updated' | 'system_alert' | 'welcome_message';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export type NotificationChannel = 'email' | 'whatsapp' | 'browser' | 'sms';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  reminderId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: NotificationChannel[];
  status: NotificationStatus;
  attempts: number;
  maxAttempts: number;
  scheduledFor?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  sentAt?: string; // ISO date string
  readAt?: string; // ISO date string
  emailSent: boolean;
  whatsappSent: boolean;
  browserSent: boolean;
  smsSent: boolean;
  emailSentAt?: string;
  whatsappSentAt?: string;
  browserSentAt?: string;
  smsSentAt?: string;
  errors: Array<{
    message: string;
    timestamp: string;
  }>;
  metadata?: any;
}

// Email service configuration
export interface EmailConfig {
  provider: 'sendgrid' | 'nodemailer' | 'resend' | 'ses';
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

// WhatsApp service configuration
export interface WhatsAppConfig {
  provider: 'ultramsg' | 'twilio' | 'whatsapp-business';
  instanceId?: string;
  token?: string;
  accountSid?: string;
  authToken?: string;
  phoneNumberId?: string;
}

// Immigration-specific enums and types
export type VisaType = 
  | 'student_visa' | 'work_visa' | 'tourist_visa' | 'business_visa' 
  | 'family_visa' | 'permanent_residency' | 'citizenship' | 'asylum' 
  | 'humanitarian' | 'skilled_worker' | 'investor_visa' | 'spouse_visa'
  | 'parent_visa' | 'child_visa' | 'working_holiday' | 'other';

export type VisaStatus = 
  | 'initial_consultation' | 'documents_collection' | 'application_preparation'
  | 'application_submitted' | 'awaiting_interview' | 'interview_scheduled'
  | 'interview_completed' | 'decision_pending' | 'approved' | 'rejected'
  | 'on_hold' | 'additional_documents_required' | 'appeal_in_progress'
  | 'visa_issued' | 'completed';

export type DocumentType = 
  | 'passport' | 'birth_certificate' | 'marriage_certificate' | 'diploma'
  | 'transcripts' | 'work_experience' | 'bank_statements' | 'tax_returns'
  | 'police_clearance' | 'medical_certificate' | 'ielts_toefl' | 'photos'
  | 'sponsor_documents' | 'property_documents' | 'insurance' | 'other';

export type DocumentStatus = 'pending' | 'received' | 'verified' | 'rejected' | 'expired';

export type CountryCode = 
  | 'US' | 'CA' | 'AU' | 'UK' | 'NZ' | 'DE' | 'FR' | 'IT' | 'ES' | 'NL'
  | 'SE' | 'NO' | 'DK' | 'CH' | 'AT' | 'IE' | 'SG' | 'JP' | 'KR' | 'HK'
  | 'AE' | 'QA' | 'SA' | 'IN' | 'CN' | 'BR' | 'MX' | 'CL' | 'AR' | 'ZA';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'ru';

export type CaseComplexity = 'simple' | 'moderate' | 'complex' | 'very_complex';

// Enhanced Customer interface for immigration
export interface ImmigrationCustomer extends Customer {
  // Personal Information
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: CountryCode;
  passportNumber?: string;
  passportExpiryDate?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
  
  // Immigration Details
  visaType: VisaType;
  visaStatus: VisaStatus;
  destinationCountry: CountryCode;
  currentCountry?: CountryCode;
  priority: Priority;
  caseComplexity: CaseComplexity;
  expectedProcessingTime?: number; // in days
  actualProcessingTime?: number; // in days
  
  // Financial Information
  packageType?: string; // "Basic", "Premium", "VIP"
  totalFees: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'partial' | 'completed' | 'overdue';
  
  // Language & Communication
  preferredLanguage: Language;
  requiresTranslation: boolean;
  communicationPreference: 'email' | 'phone' | 'whatsapp' | 'sms' | 'in_person';
  
  // Timeline & Milestones
  applicationDeadline?: string;
  consultationDate?: string;
  applicationSubmissionDate?: string;
  interviewDate?: string;
  decisionDate?: string;
  visaExpiryDate?: string;
  
  // Documents & Compliance
  documentsReceived: string[]; // Array of DocumentType
  documentsVerified: string[]; // Array of DocumentType
  complianceScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  
  // Lead Scoring & Analytics
  leadScore: number; // 0-100
  conversionProbability: number; // 0-100
  customerLifetimeValue: number;
  referralSource?: string;
  
  // Family & Dependents
  dependents?: Dependent[];
  
  // Additional Immigration Fields
  previousVisaApplications?: PreviousApplication[];
  currentVisaStatus?: string;
  hasRefusals: boolean;
  refusalDetails?: string;
  
  // AI & Automation
  aiRecommendations?: AIRecommendation[];
  automatedReminders: boolean;
  lastAiAnalysis?: string;
  
  // Integration & External Data
  governmentApplicationId?: string;
  externalSystemIds?: { [key: string]: string };
  
  // Metadata
  createdBy: string;
  lastUpdatedBy?: string;
  tags?: string[];
  customFields?: { [key: string]: any };
}

export interface Dependent {
  id: string;
  name: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  dateOfBirth: string;
  nationality: CountryCode;
  passportNumber?: string;
  includedInApplication: boolean;
  visaStatus?: VisaStatus;
}

export interface PreviousApplication {
  id: string;
  country: CountryCode;
  visaType: VisaType;
  applicationDate: string;
  decision: 'approved' | 'rejected' | 'withdrawn' | 'pending';
  refusalReason?: string;
}

export interface AIRecommendation {
  id: string;
  type: 'document' | 'timeline' | 'strategy' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  createdAt: string;
  isImplemented: boolean;
}

// Document Management
export interface Document {
  id: string;
  customerId: string;
  type: DocumentType;
  name: string;
  originalName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  status: DocumentStatus;
  uploadedAt: string;
  uploadedBy: string;
  verifiedAt?: string;
  verifiedBy?: string;
  expiryDate?: string;
  notes?: string;
  ocrData?: OCRData;
  version: number;
  previousVersions?: string[]; // Document IDs
  isRequired: boolean;
  country: CountryCode;
  size: number; // in bytes
  mimeType: string;
  tags?: string[];
}

export interface OCRData {
  text: string;
  confidence: number;
  extractedFields: { [key: string]: string };
  language: Language;
  processedAt: string;
}

// Immigration Timeline & Milestones
export interface ImmigrationTimeline {
  id: string;
  customerId: string;
  country: CountryCode;
  visaType: VisaType;
  milestones: Milestone[];
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  estimatedDate: string;
  actualDate?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  isRequired: boolean;
  dependsOn?: string[]; // Milestone IDs
  documents?: DocumentType[];
  notes?: string;
  automatedReminders: boolean;
}

// Policy & News Updates
export interface PolicyUpdate {
  id: string;
  title: string;
  description: string;
  country: CountryCode;
  visaTypes: VisaType[];
  effectiveDate: string;
  publishedAt: string;
  severity: 'info' | 'warning' | 'critical';
  source: string;
  url?: string;
  affectedCustomers?: string[]; // Customer IDs
  isRead: boolean;
  tags?: string[];
}

// Client Portal
export interface ClientPortalAccess {
  id: string;
  customerId: string;
  email: string;
  accessToken: string;
  isActive: boolean;
  lastLoginAt?: string;
  permissions: PortalPermission[];
  language: Language;
  createdAt: string;
  expiresAt?: string;
}

export type PortalPermission = 
  | 'view_documents' | 'upload_documents' | 'view_timeline' | 'view_payments'
  | 'update_profile' | 'chat_support' | 'book_appointments' | 'view_news';

export interface PortalMessage {
  id: string;
  customerId: string;
  senderId: string;
  senderType: 'customer' | 'employee' | 'system';
  message: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
  threadId?: string;
}

// Analytics & Reporting
export interface AnalyticsData {
  id: string;
  metric: string;
  value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string;
  filters?: { [key: string]: any };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageRevenuePerCustomer: number;
  conversionRate: number;
  topPerformingVisaTypes: { visaType: VisaType; revenue: number; count: number }[];
  topPerformingCountries: { country: CountryCode; revenue: number; count: number }[];
  monthlyGrowth: number;
  predictedRevenue: number;
}

export interface PerformanceMetrics {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  averageProcessingTime: number;
  successRate: number;
  customerSatisfactionScore: number;
  employeeProductivity: { [employeeId: string]: number };
  casesByStatus: { [key in VisaStatus]: number };
  casesByComplexity: { [key in CaseComplexity]: number };
}

// Compliance & Risk Management
export interface ComplianceCheck {
  id: string;
  customerId: string;
  checkType: 'document_verification' | 'sanctions_screening' | 'eligibility_check' | 'risk_assessment';
  status: 'pending' | 'passed' | 'failed' | 'requires_review';
  score: number; // 0-100
  details: string;
  performedAt: string;
  performedBy: string;
  isAutomated: boolean;
  nextCheckDue?: string;
}

export interface RiskAlert {
  id: string;
  customerId: string;
  type: 'document_expiry' | 'deadline_approaching' | 'compliance_issue' | 'payment_overdue' | 'high_risk_profile';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  isActive: boolean;
}

// AI & Machine Learning
export interface AIInsight {
  id: string;
  type: 'success_prediction' | 'risk_analysis' | 'processing_time_estimate' | 'document_recommendation' | 'timeline_optimization';
  customerId?: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: number; // 0-100
  data: any;
  createdAt: string;
  isActionable: boolean;
  actionTaken?: string;
}

export interface PredictiveAnalytics {
  customerChurnRisk: number;
  successProbability: number;
  estimatedProcessingTime: number;
  recommendedActions: string[];
  optimalTimeline: Milestone[];
  riskFactors: string[];
  opportunities: string[];
}

// Automation & Workflows
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
  executionCount: number;
}

export interface AutomationTrigger {
  type: 'document_upload' | 'status_change' | 'deadline_approaching' | 'payment_received' | 'time_based' | 'manual';
  config: any;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface AutomationAction {
  type: 'send_email' | 'send_sms' | 'create_reminder' | 'update_status' | 'assign_employee' | 'create_task' | 'webhook';
  config: any;
}

// Communication & Templates
export interface MessageTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'letter';
  language: Language;
  subject?: string;
  content: string;
  variables: string[]; // Available template variables
  category: 'welcome' | 'status_update' | 'reminder' | 'document_request' | 'appointment' | 'marketing' | 'other';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

export interface CommunicationLog {
  id: string;
  customerId: string;
  type: 'email' | 'sms' | 'whatsapp' | 'phone_call' | 'in_person' | 'video_call';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content?: string;
  sentBy?: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';  attachments?: string[];
  templateId?: string;
  automationRuleId?: string;
}

// Compliance & Policy
export interface ComplianceIssue {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'documentation' | 'timeline' | 'financial' | 'background' | 'medical' | 'language';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  relatedDocuments?: string[];
  actionRequired?: string;
}

export interface PolicyUpdate {
  id: string;
  title: string;
  description: string;
  category: 'visa_policy' | 'immigration_law' | 'processing_time' | 'fee_change' | 'document_requirement';
  country: CountryCode;
  visaTypes: VisaType[];
  effectiveDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  officialLink?: string;
  impactAssessment?: string;
  actionRequired?: boolean;
  createdAt: string;
}

// Integration & External APIs
export interface ExternalIntegration {
  id: string;
  name: string;
  type: 'government_api' | 'payment_gateway' | 'document_service' | 'translation_service' | 'notification_service';
  endpoint: string;
  apiKey?: string;
  isActive: boolean;
  lastSyncAt?: string;
  configuration: any;
  errorCount: number;
  successCount: number;
}

export interface GovernmentAPIResponse {
  applicationId: string;
  status: string;
  lastUpdated: string;
  processingTime?: number;
  nextSteps?: string;
  documents?: any[];
  fees?: any;
  appointments?: any[];
}

// Enhanced Notification Types
export interface ImmigrationNotification extends Notification {
  visaType?: VisaType;
  country?: CountryCode;
  urgency: Priority;
  category: 'deadline' | 'document' | 'status_change' | 'payment' | 'appointment' | 'policy_update' | 'system';
  actionRequired: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
  customAction?: {
    label: string;
    url: string;
    method: 'GET' | 'POST';
  };
}

