'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, FileText, Calendar, CreditCard, MessageSquare, Bell,
  Download, Eye, Upload, CheckCircle, Clock, AlertTriangle,
  Settings, HelpCircle, Phone, Mail, Languages, Shield,
  Key, Globe, Camera, Video, Mic, Home, LogOut, Menu,
  Search, Filter, ArrowRight, Star, Heart, Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  getImmigrationCustomers,
  getClientPortalAccess, 
  getPortalMessages,
  createPortalMessage,
  getCustomerDocuments,
  uploadDocument,
  getCustomerTimeline,
  addTimelineEvent,
  updateImmigrationCustomer
} from '@/lib/actions/immigrationActions';
import type { 
  ImmigrationCustomer, 
  ClientPortalAccess, 
  PortalMessage, 
  Document, 
  ImmigrationTimeline,
  Language 
} from '@/lib/types';

interface FullClientPortalProps {
  customerId?: string;
  accessToken?: string;
}

export function FullClientPortal({ customerId, accessToken }: FullClientPortalProps) {
  const [customer, setCustomer] = useState<ImmigrationCustomer | null>(null);
  const [portalAccess, setPortalAccess] = useState<ClientPortalAccess | null>(null);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timeline, setTimeline] = useState<ImmigrationTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newMessage, setNewMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Demo customer data for now
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // For demo purposes, create mock data
        const mockCustomer: ImmigrationCustomer = {
          id: customerId || 'demo-customer-1',
          name: 'John Smith',
          email: 'john.smith@email.com',
          phoneNumber: '+1-555-0123',
          category: 'Immigration Client',
          status: 'hot',
          assignedTo: 'immigration-officer-1',
          notes: 'Premium immigration package client',
          createdAt: new Date().toISOString(),
          lastContacted: new Date().toISOString(),
          
          // Immigration specific fields
          visaType: 'work_visa',
          visaStatus: 'application_submitted',
          destinationCountry: 'US',
          currentCountry: 'IN',
          nationality: 'IN',
          priority: 'high',
          caseComplexity: 'moderate',
          totalFees: 8500,
          paidAmount: 6000,
          remainingAmount: 2500,
          paymentStatus: 'partial',
          preferredLanguage: 'en',
          requiresTranslation: false,
          communicationPreference: 'email',
          documentsReceived: ['passport', 'education-certificates', 'experience-letters'],
          documentsVerified: ['passport', 'education-certificates'],
          complianceScore: 92,
          riskLevel: 'low',
          leadScore: 85,
          conversionProbability: 95,
          customerLifetimeValue: 8500,
          maritalStatus: 'married',
          packageType: 'Premium',
          expectedProcessingTime: 120,
          referralSource: 'Website',
          hasRefusals: false,
          automatedReminders: true,
          createdBy: 'system'
        };

        const mockPortalAccess: ClientPortalAccess = {
          id: 'portal-access-1',
          customerId: mockCustomer.id,
          email: mockCustomer.email,
          accessToken: accessToken || 'demo-token-123',
          isActive: true,
          permissions: ['view_documents', 'upload_documents', 'view_timeline', 'view_payments', 'update_profile', 'chat_support', 'book_appointments', 'view_news'],
          language: 'en',
          createdAt: new Date().toISOString()
        };

        const mockMessages: PortalMessage[] = [
          {
            id: 'msg-1',
            customerId: mockCustomer.id,
            senderId: 'immigration-officer-1',
            senderType: 'employee',
            message: 'Hello John! Your work visa application has been submitted successfully. We will keep you updated on the progress.',
            attachments: [],
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'msg-2',
            customerId: mockCustomer.id,
            senderId: 'system',
            senderType: 'system',
            message: 'Reminder: Please upload your medical examination certificate by the end of this week.',
            attachments: [],
            isRead: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        const mockDocuments: Document[] = [
          {
            id: 'doc-1',
            name: 'Passport Copy',
            type: 'passport',
            size: 2048576,
            url: '/documents/passport-john-smith.pdf',
            status: 'verified',
            uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: mockCustomer.id,
            verifiedBy: 'immigration-officer-1',
            verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            isRequired: true,
            expiryDate: '2030-06-15',
            notes: 'Clear copy, all details visible'
          },
          {
            id: 'doc-2',
            name: 'Education Certificates',
            type: 'education-certificates',
            size: 4096576,
            url: '/documents/education-john-smith.pdf',
            status: 'verified',
            uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedBy: mockCustomer.id,
            verifiedBy: 'immigration-officer-1',
            verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            isRequired: true,
            notes: 'Bachelor\'s and Master\'s degrees verified'
          }
        ];

        const mockTimeline: ImmigrationTimeline[] = [
          {
            id: 'timeline-1',
            customerId: mockCustomer.id,
            country: 'US',
            visaType: 'work_visa',
            milestones: [
              {
                id: 'milestone-1',
                title: 'Initial Consultation',
                description: 'Met with immigration officer to discuss case',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
                isCompleted: true
              },
              {
                id: 'milestone-2',
                title: 'Document Collection',
                description: 'Collected all required documents',
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
                isCompleted: true
              },
              {
                id: 'milestone-3',
                title: 'Application Submission',
                description: 'Work visa application submitted to USCIS',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
                isCompleted: true
              },
              {
                id: 'milestone-4',
                title: 'Medical Examination',
                description: 'Complete medical examination',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending',
                isCompleted: false
              }
            ],
            estimatedCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        setCustomer(mockCustomer);
        setPortalAccess(mockPortalAccess);
        setMessages(mockMessages);
        setDocuments(mockDocuments);
        setTimeline(mockTimeline);
      } catch (error) {
        console.error('Failed to load portal data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [customerId, accessToken]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !customer) return;

    const message: PortalMessage = {
      id: `msg-${Date.now()}`,
      customerId: customer.id,
      senderId: customer.id,
      senderType: 'customer',
      message: newMessage.trim(),
      attachments: [],
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-green-500">Verified</Badge>;
      case 'pending': return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case 'rejected': return <Badge className="bg-red-500">Rejected</Badge>;
      default: return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!customer || !portalAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Unable to access the client portal. Please check your access credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'timeline', label: 'Case Timeline', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Immigration Portal</h1>
                <p className="text-sm text-gray-500">Welcome back, {customer.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarFallback>
                {customer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                      ${activeTab === item.id 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                  
                  {/* Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Case Status</p>
                            <p className="text-2xl font-bold text-gray-900 capitalize">
                              {customer.visaStatus.replace('_', ' ')}
                            </p>
                          </div>
                          <Calendar className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Documents</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {documents.filter(d => d.status === 'verified').length}/{documents.length}
                            </p>
                          </div>
                          <FileText className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Payment Status</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ${customer.paidAmount.toLocaleString()}
                            </p>
                          </div>
                          <CreditCard className="h-8 w-8 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                            <p className="text-2xl font-bold text-gray-900">{customer.complianceScore}%</p>
                          </div>
                          <Shield className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {messages.slice(0, 3).map((message) => (
                          <div key={message.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {message.senderType === 'system' ? 'S' : 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{message.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {documents.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <FileText className="h-8 w-8 text-blue-500" />
                              <div>
                                <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                                <p className="text-sm text-gray-500">
                                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getDocumentStatusBadge(doc.status)}
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Case Timeline</h2>
                  
                  {timeline.map((timelineItem) => (
                    <Card key={timelineItem.id}>
                      <CardHeader>
                        <CardTitle>Immigration Process Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {timelineItem.milestones.map((milestone, index) => (
                            <div key={milestone.id} className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`
                                  h-4 w-4 rounded-full ${getStatusColor(milestone.status)}
                                  ${milestone.isCompleted ? 'animate-pulse' : ''}
                                `} />
                                {index < timelineItem.milestones.length - 1 && (
                                  <div className="h-12 w-0.5 bg-gray-300 mt-2" />
                                )}
                              </div>
                              <div className="flex-1 pb-6">
                                <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(milestone.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Payments & Billing</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Total Fees</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-gray-900">
                          ${customer.totalFees.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Amount Paid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-600">
                          ${customer.paidAmount.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Remaining Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-orange-600">
                          ${customer.remainingAmount.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Progress 
                          value={(customer.paidAmount / customer.totalFees) * 100} 
                          className="h-3"
                        />
                        <p className="text-sm text-gray-600">
                          {((customer.paidAmount / customer.totalFees) * 100).toFixed(1)}% paid
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {customer.remainingAmount > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Make a Payment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Input 
                            type="number" 
                            placeholder="Enter amount" 
                            max={customer.remainingAmount}
                          />
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            Pay Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Send New Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Type your message here..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={3}
                        />
                        <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Message History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`
                              p-4 rounded-lg ${
                                message.senderType === 'customer' 
                                  ? 'bg-blue-100 ml-8' 
                                  : 'bg-gray-100 mr-8'
                              }
                            `}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{message.message}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {message.senderType === 'customer' ? 'You' : 'Immigration Officer'} • {' '}
                                  {new Date(message.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {!message.isRead && message.senderType !== 'customer' && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <Input value={customer.name} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <Input value={customer.email} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <Input value={customer.phoneNumber} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Language
                          </label>
                          <Select value={customer.preferredLanguage}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="hi">Hindi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Update Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Immigration Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visa Type
                          </label>
                          <Input value={customer.visaType.replace('_', ' ').toUpperCase()} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Status
                          </label>
                          <Input value={customer.visaStatus.replace('_', ' ')} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Destination Country
                          </label>
                          <Input value={customer.destinationCountry} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Package Type
                          </label>
                          <Input value={customer.packageType} disabled />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'support' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Support & Help</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Phone Support</p>
                            <p className="text-sm text-gray-600">+1-800-IMMIGRATION</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Email Support</p>
                            <p className="text-sm text-gray-600">support@immigrationfirm.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Business Hours</p>
                            <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM EST</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Helpful Resources</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Document Checklist
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Frequently Asked Questions
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Globe className="h-4 w-4 mr-2" />
                          Immigration News & Updates
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Consultation
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Submit Support Ticket</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">Document Related</SelectItem>
                          <SelectItem value="payment">Payment Issue</SelectItem>
                          <SelectItem value="timeline">Timeline Question</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea 
                        placeholder="Describe your issue or question..."
                        rows={4}
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Submit Ticket
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
