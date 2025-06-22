'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Users, TrendingUp, FileText, Brain, Shield,
  Newspaper, Target, DollarSign, Calendar, BarChart3,
  Settings, RefreshCw, Download, Bell, HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIImmigrationAssistant } from './AIImmigrationAssistant';
import { SmartDocumentManager } from './SmartDocumentManager';
import { VisaTimelineTracker } from './VisaTimelineTracker';
import { ComplianceChecker } from './ComplianceChecker';
import { ImmigrationNewsFeed } from './ImmigrationNewsFeed';
import { ClientPortal } from './ClientPortal';
import { RevenueAnalytics } from './RevenueAnalytics';
import { LeadScoringSystem } from './LeadScoringSystem';
import type { ImmigrationCustomer, User, ClientPortalAccess } from '@/lib/types';

interface ImmigrationDashboardProps {
  customers: ImmigrationCustomer[];
  currentUser: User;
}

// Mock data for demonstration
const mockCustomer: ImmigrationCustomer = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@email.com',
  phoneNumber: '+1-555-0123',
  category: 'US Immigration',
  status: 'hot',
  assignedTo: 'user1',
  notes: 'Interested in student visa',
  createdAt: new Date().toISOString(),
  lastContacted: new Date().toISOString(),
  
  // Immigration-specific fields
  firstName: 'John',
  lastName: 'Smith',
  dateOfBirth: '1990-05-15',
  nationality: 'IN',
  passportNumber: 'P1234567',
  passportExpiryDate: '2030-05-15',
  maritalStatus: 'single',
  
  visaType: 'student_visa',
  visaStatus: 'application_preparation',
  destinationCountry: 'US',
  currentCountry: 'IN',
  priority: 'high',
  caseComplexity: 'moderate',
  expectedProcessingTime: 120,
  
  packageType: 'Premium',
  totalFees: 5000,
  paidAmount: 2500,
  remainingAmount: 2500,
  paymentStatus: 'partial',
  
  preferredLanguage: 'en',
  requiresTranslation: false,
  communicationPreference: 'email',
  
  applicationDeadline: '2024-06-01',
  consultationDate: '2024-01-20',
  
  documentsReceived: ['passport', 'bank_statements'],
  documentsVerified: ['passport'],
  complianceScore: 75,
  riskLevel: 'low',
  
  leadScore: 85,
  conversionProbability: 80,
  customerLifetimeValue: 7500,
  referralSource: 'website',
  
  hasRefusals: false,
  automatedReminders: true,
  
  createdBy: 'user1',
  tags: ['student', 'US', 'engineering']
};

const mockPortalAccess: ClientPortalAccess = {
  customerId: '1',
  isActive: true,
  permissions: ['view_documents', 'upload_documents', 'view_timeline', 'view_payments'],
  lastLogin: new Date().toISOString(),
  loginCount: 15,
  language: 'en'
};

export function ImmigrationDashboard({ customers, currentUser }: ImmigrationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCustomer] = useState<ImmigrationCustomer>(mockCustomer);

  // Calculate dashboard metrics
  const totalCustomers = customers.length;
  const activeApplications = customers.filter(c => 
    ['application_preparation', 'application_submitted', 'interview_scheduled'].includes(c.visaStatus)
  ).length;
  const approvedApplications = customers.filter(c => c.visaStatus === 'approved').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalFees, 0);
  const averageProcessingTime = customers.reduce((sum, c) => sum + (c.expectedProcessingTime || 0), 0) / customers.length;

  const approvalRate = totalCustomers > 0 ? (approvedApplications / totalCustomers) * 100 : 0;
  const conversionRate = customers.filter(c => c.paymentStatus === 'completed').length / totalCustomers * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Immigration CRM Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive immigration case management and analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                <p className="text-xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Applications</p>
                <p className="text-xl font-bold">{activeApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-xl font-bold">{approvalRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50">
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                <Calendar className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-xl font-bold">{averageProcessingTime.toFixed(0)} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900/50">
                <BarChart3 className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-bold">{conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-1">
              <Newspaper className="h-3 w-3" />
              News
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Lead Scoring
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'New application submitted', client: 'Sarah Johnson', time: '2 hours ago', status: 'success' },
                      { action: 'Document verification completed', client: 'Mike Chen', time: '4 hours ago', status: 'success' },
                      { action: 'Interview scheduled', client: 'Emma Wilson', time: '6 hours ago', status: 'pending' },
                      { action: 'Payment received', client: 'David Brown', time: '1 day ago', status: 'success' },
                      { action: 'Document missing', client: 'Lisa Garcia', time: '1 day ago', status: 'warning' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.client} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Case Success Rate</span>
                        <span className="text-sm text-muted-foreground">{approvalRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={approvalRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Client Satisfaction</span>
                        <span className="text-sm text-muted-foreground">94.5%</span>
                      </div>
                      <Progress value={94.5} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">On-time Delivery</span>
                        <span className="text-sm text-muted-foreground">87.2%</span>
                      </div>
                      <Progress value={87.2} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Revenue Target</span>
                        <span className="text-sm text-muted-foreground">78.3%</span>
                      </div>
                      <Progress value={78.3} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'New Client', icon: Users, color: 'bg-blue-500' },
                    { label: 'Upload Documents', icon: FileText, color: 'bg-green-500' },
                    { label: 'Schedule Meeting', icon: Calendar, color: 'bg-purple-500' },
                    { label: 'Send Reminder', icon: Bell, color: 'bg-orange-500' },
                    { label: 'Generate Report', icon: BarChart3, color: 'bg-teal-500' },
                    { label: 'Help Center', icon: HelpCircle, color: 'bg-gray-500' }
                  ].map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button key={index} variant="outline" className="h-20 flex-col gap-2">
                        <div className={`p-2 rounded-full ${action.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs">{action.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-assistant">
            <AIImmigrationAssistant 
              customer={selectedCustomer}
              onRecommendationApply={(rec) => console.log('Applied recommendation:', rec)}
              onActionSuggested={(action, data) => console.log('Suggested action:', action, data)}
            />
          </TabsContent>

          <TabsContent value="documents">
            <SmartDocumentManager
              customerId={selectedCustomer.id}
              customerName={selectedCustomer.name}
              destinationCountry={selectedCustomer.destinationCountry}
              visaType={selectedCustomer.visaType}
              onDocumentUpload={(doc) => console.log('Document uploaded:', doc)}
              onDocumentVerify={(id, status) => console.log('Document verified:', id, status)}
              onDocumentDelete={(id) => console.log('Document deleted:', id)}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <VisaTimelineTracker
              customerId={selectedCustomer.id}
              visaType={selectedCustomer.visaType}
              destinationCountry={selectedCustomer.destinationCountry}
              currentStatus={selectedCustomer.visaStatus}
              onMilestoneUpdate={(id, status) => console.log('Milestone updated:', id, status)}
              onTimelinePrediction={(prediction) => console.log('Timeline prediction:', prediction)}
            />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceChecker
              customer={selectedCustomer}
              onComplianceUpdate={(id, score, issues) => console.log('Compliance updated:', id, score, issues)}
              onPolicyAlert={(policy) => console.log('Policy alert:', policy)}
            />
          </TabsContent>

          <TabsContent value="news">
            <ImmigrationNewsFeed
              userCountries={[selectedCustomer.destinationCountry]}
              userVisaTypes={[selectedCustomer.visaType]}
              onNewsBookmark={(id) => console.log('News bookmarked:', id)}
              onNewsShare={(id) => console.log('News shared:', id)}
            />
          </TabsContent>

          <TabsContent value="scoring">
            <LeadScoringSystem
              customers={customers}
              onScoreUpdate={(id, score, factors) => console.log('Score updated:', id, score, factors)}
              onLeadAssign={(id, priority) => console.log('Lead assigned:', id, priority)}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <RevenueAnalytics
              customers={customers}
              onExport={(data) => console.log('Exporting data:', data)}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Demo Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/20">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Immigration CRM Demo</p>
                <p className="text-xs opacity-90">Featuring AI-powered tools for immigration consultancy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
