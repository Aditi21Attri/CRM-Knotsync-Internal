'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle, AlertTriangle, Target,
  TrendingUp, TrendingDown, Zap, Brain, Globe,
  Users, FileText, Phone, MessageSquare, MapPin,
  ChevronRight, ChevronDown, Play, Pause, FastForward
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { ImmigrationTimeline, Milestone, VisaType, CountryCode, VisaStatus } from '@/lib/types';

interface TimelineTrackerProps {
  customerId: string;
  visaType: VisaType;
  destinationCountry: CountryCode;
  currentStatus: VisaStatus;
  onMilestoneUpdate?: (milestoneId: string, status: string) => void;
  onTimelinePrediction?: (prediction: any) => void;
}

const statusColors = {
  'upcoming': 'bg-gray-100 text-gray-700 border-gray-300',
  'in_progress': 'bg-blue-100 text-blue-700 border-blue-300',
  'completed': 'bg-green-100 text-green-700 border-green-300',
  'delayed': 'bg-red-100 text-red-700 border-red-300',
  'skipped': 'bg-yellow-100 text-yellow-700 border-yellow-300'
};

const statusIcons = {
  'upcoming': Clock,
  'in_progress': Play,
  'completed': CheckCircle,
  'delayed': AlertTriangle,
  'skipped': FastForward
};

const milestoneTemplates: { [key: string]: Milestone[] } = {
  'student_visa_US': [
    {
      id: '1',
      name: 'Initial Consultation',
      description: 'Assessment of eligibility and document requirements',
      estimatedDate: '2025-06-23T10:00:00Z',
      status: 'completed',
      isRequired: true,
      documents: ['passport', 'photos'],
      automatedReminders: true,
      notes: 'Completed successfully'
    },
    {
      id: '2',
      name: 'Document Collection',
      description: 'Gather all required documents for application',
      estimatedDate: '2025-07-01T00:00:00Z',
      status: 'in_progress',
      isRequired: true,
      dependsOn: ['1'],
      documents: ['transcripts', 'bank_statements', 'ielts_toefl'],
      automatedReminders: true
    },
    {
      id: '3',
      name: 'SEVIS Registration',
      description: 'Complete SEVIS I-901 fee payment and registration',
      estimatedDate: '2025-07-10T00:00:00Z',
      status: 'upcoming',
      isRequired: true,
      dependsOn: ['2'],
      automatedReminders: true
    },
    {
      id: '4',
      name: 'DS-160 Application',
      description: 'Complete online non-immigrant visa application',
      estimatedDate: '2025-07-15T00:00:00Z',
      status: 'upcoming',
      isRequired: true,
      dependsOn: ['3'],
      documents: ['photos'],
      automatedReminders: true
    },
    {
      id: '5',
      name: 'Visa Fee Payment',
      description: 'Pay visa application fee',
      estimatedDate: '2025-07-17T00:00:00Z',
      status: 'upcoming',
      isRequired: true,
      dependsOn: ['4'],
      automatedReminders: true
    },
    {
      id: '6',
      name: 'Interview Scheduling',
      description: 'Schedule visa interview appointment',
      estimatedDate: '2025-07-20T00:00:00Z',
      status: 'upcoming',
      isRequired: true,
      dependsOn: ['5'],
      automatedReminders: true
    },
    {
      id: '7',
      name: 'Interview Preparation',
      description: 'Prepare for visa interview with mock sessions',
      estimatedDate: '2025-08-01T00:00:00Z',
      status: 'upcoming',
      isRequired: false,
      dependsOn: ['6'],
      automatedReminders: true
    },
    {
      id: '8',
      name: 'Visa Interview',
      description: 'Attend visa interview at US Consulate',
      estimatedDate: '2025-08-15T09:00:00Z',
      status: 'upcoming',
      isRequired: true,
      dependsOn: ['7'],
      automatedReminders: true
    },
    {
      id: '9',
      name: 'Decision & Collection',
      description: 'Visa decision and passport collection',
      estimatedDate: '2025-08-22T00:00:00Z',
      status: 'upcoming',
      isRequired: true,
      dependsOn: ['8'],
      automatedReminders: true
    },
    {
      id: '10',
      name: 'Travel Preparation',
      description: 'Final preparations for travel to US',
      estimatedDate: '2025-08-25T00:00:00Z',
      status: 'upcoming',
      isRequired: false,
      dependsOn: ['9'],
      automatedReminders: true
    }
  ]
};

const processingTimeData = [
  { month: 'Jan', avgTime: 45, yourCase: null },
  { month: 'Feb', avgTime: 42, yourCase: null },
  { month: 'Mar', avgTime: 48, yourCase: null },
  { month: 'Apr', avgTime: 44, yourCase: null },
  { month: 'May', avgTime: 46, yourCase: null },
  { month: 'Jun', avgTime: 43, yourCase: 25 },
  { month: 'Jul', avgTime: 45, yourCase: null },
  { month: 'Aug', avgTime: 47, yourCase: null }
];

const successRateData = [
  { category: 'Student Visa', rate: 85, count: 150 },
  { category: 'Work Visa', rate: 78, count: 120 },
  { category: 'Family Visa', rate: 92, count: 80 },
  { category: 'Tourist Visa', rate: 88, count: 200 },
  { category: 'Business Visa', rate: 82, count: 90 }
];

export function VisaTimelineTracker({ 
  customerId, 
  visaType, 
  destinationCountry, 
  currentStatus,
  onMilestoneUpdate,
  onTimelinePrediction 
}: TimelineTrackerProps) {
  const [timeline, setTimeline] = useState<ImmigrationTimeline>({
    id: '1',
    customerId,
    country: destinationCountry,
    visaType,
    milestones: milestoneTemplates[`${visaType}_${destinationCountry}`] || milestoneTemplates['student_visa_US'],
    estimatedCompletionDate: '2025-08-25T00:00:00Z',
    createdAt: '2025-06-22T00:00:00Z',
    updatedAt: '2025-06-22T00:00:00Z'
  });

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictiveInsights, setPredictiveInsights] = useState({
    estimatedCompletionDate: '2025-08-25',
    successProbability: 87,
    riskFactors: [
      'Document submission deadline approaching',
      'Interview scheduling delays possible'
    ],
    recommendations: [
      'Submit bank statements within 3 days',
      'Schedule interview as soon as slot opens',
      'Prepare backup documentation'
    ],
    comparativeData: {
      averageProcessingTime: 45,
      yourEstimatedTime: 38,
      performanceBetter: 85
    }
  });

  const getProgressPercentage = () => {
    const completed = timeline.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / timeline.milestones.length) * 100);
  };

  const getNextMilestone = () => {
    return timeline.milestones.find(m => m.status === 'upcoming' || m.status === 'in_progress');
  };

  const getDaysUntilNext = () => {
    const next = getNextMilestone();
    if (!next) return 0;
    const days = Math.ceil((new Date(next.estimatedDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDelayedMilestones = () => {
    return timeline.milestones.filter(m => {
      if (m.status === 'completed') return false;
      return new Date(m.estimatedDate) < new Date();
    });
  };

  const MilestoneCard = ({ milestone, index }: { milestone: Milestone; index: number }) => {
    const StatusIcon = statusIcons[milestone.status];
    const isLast = index === timeline.milestones.length - 1;
    const isDelayed = new Date(milestone.estimatedDate) < new Date() && milestone.status !== 'completed';

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative"
      >
        {/* Timeline Line */}
        {!isLast && (
          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-700" />
        )}

        <div className="flex gap-4 pb-6">
          {/* Status Indicator */}
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-full border-2 z-10
            ${statusColors[milestone.status]}
            ${isDelayed && milestone.status !== 'completed' ? 'animate-pulse' : ''}
          `}>
            <StatusIcon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMilestone(milestone)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{milestone.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                  </div>
                  <Badge 
                    variant={isDelayed ? 'destructive' : 'secondary'}
                    className="ml-2"
                  >
                    {milestone.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(milestone.estimatedDate).toLocaleDateString()}</span>
                    {isDelayed && <span className="text-red-600">(Overdue)</span>}
                  </div>
                  
                  {milestone.documents && milestone.documents.length > 0 && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{milestone.documents.length} docs</span>
                    </div>
                  )}
                </div>

                {milestone.actualDate && (
                  <div className="mt-2 text-xs text-green-600">
                    Completed: {new Date(milestone.actualDate).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-xl font-bold">{getProgressPercentage()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-xl font-bold">{predictiveInsights.successProbability}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next Milestone</p>
                <p className="text-xl font-bold">{getDaysUntilNext()} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Visa Application Timeline
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={getProgressPercentage()} className="w-32" />
                  <span className="text-sm text-gray-600">{getProgressPercentage()}% Complete</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-0">
                  {timeline.milestones.map((milestone, index) => (
                    <MilestoneCard key={milestone.id} milestone={milestone} index={index} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Delayed Milestones Alert */}
          {getDelayedMilestones().length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800 dark:text-red-400">
                    {getDelayedMilestones().length} Delayed Milestone(s)
                  </h3>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Some milestones are behind schedule. Consider expediting or adjusting the timeline.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Estimated Completion</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Date(predictiveInsights.estimatedCompletionDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {predictiveInsights.comparativeData.performanceBetter}% faster than average
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Risk Factors
                  </h4>
                  <ul className="space-y-1">
                    {predictiveInsights.riskFactors.map((risk, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-orange-400 rounded-full" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {predictiveInsights.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Time Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={processingTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avgTime" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Average Time (days)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="yourCase" 
                      stroke="#82ca9d" 
                      strokeWidth={3}
                      name="Your Case (days)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rates by Visa Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={successRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {predictiveInsights.comparativeData.yourEstimatedTime}
                    </p>
                    <p className="text-sm text-gray-600">Your Est. Days</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">
                      {predictiveInsights.comparativeData.averageProcessingTime}
                    </p>
                    <p className="text-sm text-gray-600">Average Days</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completion Rate</span>
                    <span className="font-semibold">{getProgressPercentage()}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Probability</span>
                    <span className="font-semibold">{predictiveInsights.successProbability}%</span>
                  </div>
                  <Progress value={predictiveInsights.successProbability} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Efficiency</span>
                    <span className="font-semibold">{predictiveInsights.comparativeData.performanceBetter}%</span>
                  </div>
                  <Progress value={predictiveInsights.comparativeData.performanceBetter} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Milestone Detail Dialog */}
      <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMilestone?.name}</DialogTitle>
          </DialogHeader>
          {selectedMilestone && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">{selectedMilestone.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Estimated Date</label>
                  <p className="text-sm">{new Date(selectedMilestone.estimatedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className="ml-2">{selectedMilestone.status.replace('_', ' ')}</Badge>
                </div>
              </div>

              {selectedMilestone.documents && selectedMilestone.documents.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Required Documents</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedMilestone.documents.map((doc, index) => (
                      <Badge key={index} variant="outline">{doc.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedMilestone.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMilestone.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => onMilestoneUpdate?.(selectedMilestone.id, 'completed')}
                  disabled={selectedMilestone.status === 'completed'}
                >
                  Mark Complete
                </Button>
                <Button variant="outline">
                  Reschedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
