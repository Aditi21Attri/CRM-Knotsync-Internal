'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, FileText, Calendar, CreditCard, MessageSquare,
  Download, Eye, Upload, CheckCircle, Clock, AlertTriangle,
  Bell, Settings, HelpCircle, Phone, Mail, Languages,
  Shield, Key, Globe, Camera, Video, Mic
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
import type { 
  ImmigrationCustomer, Document, ImmigrationTimeline, 
  ClientPortalAccess, PortalPermission, Language 
} from '@/lib/types';

interface ClientPortalProps {
  customer: ImmigrationCustomer;
  portalAccess: ClientPortalAccess;
  onDocumentUpload?: (file: File, category: string) => void;
  onMessageSend?: (message: string, attachments?: File[]) => void;
  onAppointmentRequest?: (type: string, preferredDates: string[]) => void;
  onLanguageChange?: (language: Language) => void;
}

interface PortalMessage {
  id: string;
  from: 'client' | 'agent' | 'system';
  message: string;
  timestamp: string;
  attachments?: string[];
  isRead: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface AppointmentSlot {
  id: string;
  type: 'consultation' | 'document_review' | 'interview_prep' | 'follow_up';
  title: string;
  description: string;
  duration: number; // in minutes
  availableSlots: string[];
  timeZone: string;
}

const mockMessages: PortalMessage[] = [
  {
    id: '1',
    from: 'agent',
    message: 'Welcome to your immigration case portal! I\'ve reviewed your initial documents and everything looks good. Next, we\'ll need your updated bank statements.',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: true
  },
  {
    id: '2',
    from: 'system',
    message: 'Reminder: Your visa interview is scheduled for January 25th at 2:00 PM. Please prepare the required documents.',
    timestamp: '2024-01-14T09:00:00Z',
    isRead: false,
    priority: 'high'
  },
  {
    id: '3',
    from: 'client',
    message: 'Thank you for the update. I\'ve uploaded the bank statements. When should I expect the next update?',
    timestamp: '2024-01-13T16:45:00Z',
    isRead: true
  }
];

const appointmentTypes: AppointmentSlot[] = [
  {
    id: '1',
    type: 'consultation',
    title: 'Initial Consultation',
    description: 'Comprehensive review of your case and next steps',
    duration: 60,
    availableSlots: ['2024-01-20T10:00:00Z', '2024-01-20T14:00:00Z', '2024-01-21T09:00:00Z'],
    timeZone: 'PST'
  },
  {
    id: '2',
    type: 'document_review',
    title: 'Document Review Session',
    description: 'Review and verify your submitted documents',
    duration: 30,
    availableSlots: ['2024-01-22T11:00:00Z', '2024-01-22T15:00:00Z', '2024-01-23T10:00:00Z'],
    timeZone: 'PST'
  },
  {
    id: '3',
    type: 'interview_prep',
    title: 'Interview Preparation',
    description: 'Practice session for your visa interview',
    duration: 45,
    availableSlots: ['2024-01-24T13:00:00Z', '2024-01-24T16:00:00Z', '2024-01-25T09:00:00Z'],
    timeZone: 'PST'
  }
];

export function ClientPortal({ 
  customer, 
  portalAccess, 
  onDocumentUpload, 
  onMessageSend, 
  onAppointmentRequest,
  onLanguageChange 
}: ClientPortalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [messages, setMessages] = useState<PortalMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<Language>(customer.preferredLanguage || 'en');
  const [isUploading, setIsUploading] = useState(false);

  const hasPermission = (permission: PortalPermission): boolean => {
    return portalAccess.permissions.includes(permission);
  };

  const getTimelineProgress = (): number => {
    // Mock calculation based on customer status
    const statusProgress: { [key: string]: number } = {
      'initial_consultation': 10,
      'documents_collection': 25,
      'application_preparation': 50,
      'application_submitted': 70,
      'interview_scheduled': 85,
      'approved': 100
    };
    return statusProgress[customer.visaStatus] || 0;
  };

  const unreadMessages = messages.filter(m => !m.isRead && m.from !== 'client').length;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: PortalMessage = {
      id: Date.now().toString(),
      from: 'client',
      message: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    onMessageSend?.(newMessage);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUploading(false);
    
    onDocumentUpload?.(file, category);
  };

  const getLanguageName = (code: Language): string => {
    const languages: { [key in Language]: string } = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'zh': '中文',
      'ja': '日本語',
      'ko': '한국어',
      'ar': 'العربية',
      'hi': 'हिन्दी',
      'ru': 'Русский'
    };
    return languages[code];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarImage src={customer.profilePhoto} />
              <AvatarFallback className="bg-white/20 text-white text-lg">
                {customer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {customer.firstName || customer.name}!</h1>
              <p className="text-blue-100">
                {customer.visaType.replace('_', ' ').toUpperCase()} • {customer.destinationCountry}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Case ID: {customer.id.slice(0, 8)}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {customer.visaStatus.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-blue-100">Case Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={getTimelineProgress()} className="w-24 bg-white/20" />
                <span className="text-sm font-semibold">{getTimelineProgress()}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              {unreadMessages > 0 && (
                <Button variant="secondary" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                    {unreadMessages}
                  </Badge>
                </Button>
              )}
              
              <Select value={language} onValueChange={(value: Language) => {
                setLanguage(value);
                onLanguageChange?.(value);
              }}>
                <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
                  <Languages className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['en', 'es', 'fr', 'de', 'zh'] as Language[]).map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {getLanguageName(lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2" disabled={!hasPermission('view_documents')}>
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2" disabled={!hasPermission('view_timeline')}>
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2" disabled={!hasPermission('view_payments')}>
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2 relative">
            <MessageSquare className="h-4 w-4" />
            Messages
            {unreadMessages > 0 && (
              <Badge className="ml-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs p-0">
                {unreadMessages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-semibold capitalize">
                        {customer.visaStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <Progress value={getTimelineProgress()} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Your application is progressing well. Next step: Document verification
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Next Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-semibold">Document Review</div>
                    <div className="text-sm text-muted-foreground">
                      January 22, 2024 at 2:00 PM
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <Video className="h-3 w-3 mr-1" />
                      Join Video Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Your Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">John Doe</div>
                        <div className="text-sm text-muted-foreground">Immigration Consultant</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'document', message: 'Bank statements uploaded and verified', time: '2 hours ago', status: 'completed' },
                  { type: 'message', message: 'New message from your agent', time: '1 day ago', status: 'unread' },
                  { type: 'appointment', message: 'Document review scheduled', time: '2 days ago', status: 'scheduled' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                      activity.status === 'unread' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.type === 'document' ? <FileText className="h-4 w-4" /> :
                       activity.type === 'message' ? <MessageSquare className="h-4 w-4" /> :
                       <Calendar className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.message}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Document Center</CardTitle>
                {hasPermission('upload_documents') && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="bank_statements">Bank Statements</SelectItem>
                            <SelectItem value="diploma">Diploma/Certificate</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'general')}
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="text-sm">Uploading...</span>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Passport Copy', type: 'passport', status: 'verified', uploadedAt: '2024-01-10' },
                  { name: 'Bank Statements (Dec 2023)', type: 'bank_statements', status: 'verified', uploadedAt: '2024-01-12' },
                  { name: 'University Diploma', type: 'diploma', status: 'pending', uploadedAt: '2024-01-14' },
                  { name: 'English Test Results', type: 'language_test', status: 'verified', uploadedAt: '2024-01-08' }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {doc.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card className="h-96">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${
                        message.from === 'client' 
                          ? 'bg-primary text-primary-foreground' 
                          : message.from === 'system'
                          ? 'bg-muted border'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 mt-4">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 resize-none"
                  rows={2}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Timeline view would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Payment details and history would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {appointmentTypes.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{appointment.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{appointment.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{appointment.duration} minutes</span>
                      <Button size="sm">Book Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
