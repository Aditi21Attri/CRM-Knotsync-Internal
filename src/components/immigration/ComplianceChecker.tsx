'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Clock,
  FileText, Gavel, Globe, TrendingUp, Zap, Brain,
  RefreshCw, Download, Eye, Settings, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ImmigrationCustomer, CountryCode, VisaType, ComplianceIssue, PolicyUpdate } from '@/lib/types';

interface ComplianceCheckerProps {
  customer: ImmigrationCustomer;
  onComplianceUpdate?: (customerId: string, score: number, issues: ComplianceIssue[]) => void;
  onPolicyAlert?: (policy: PolicyUpdate) => void;
}

interface ComplianceRule {
  id: string;
  category: 'documentation' | 'timeline' | 'financial' | 'background' | 'medical' | 'language';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'compliant' | 'warning' | 'violation' | 'pending';
  recommendation?: string;
  dueDate?: string;
  completedDate?: string;
  autoCheck: boolean;
}

const complianceRuleTemplates: { [key: string]: ComplianceRule[] } = {
  'US_student_visa': [
    {
      id: 'doc_passport',
      category: 'documentation',
      title: 'Valid Passport',
      description: 'Passport must be valid for at least 6 months beyond intended stay',
      severity: 'critical',
      status: 'pending',
      recommendation: 'Ensure passport validity extends beyond study period',
      autoCheck: true
    },
    {
      id: 'doc_i20',
      category: 'documentation',
      title: 'Form I-20',
      description: 'Valid Form I-20 from SEVP-approved school',
      severity: 'critical',
      status: 'pending',
      recommendation: 'Request Form I-20 from designated school official',
      autoCheck: false
    },
    {
      id: 'fin_proof',
      category: 'financial',
      title: 'Financial Proof',
      description: 'Demonstrate sufficient funds for tuition and living expenses',
      severity: 'high',
      status: 'pending',
      recommendation: 'Provide bank statements showing required amount',
      autoCheck: true
    },
    {
      id: 'lang_proficiency',
      category: 'language',
      title: 'English Proficiency',
      description: 'TOEFL/IELTS scores meeting university requirements',
      severity: 'high',
      status: 'pending',
      recommendation: 'Take English proficiency test if not native speaker',
      autoCheck: false
    }
  ],
  'Canada_express_entry': [
    {
      id: 'lang_test',
      category: 'language',
      title: 'Language Test Results',
      description: 'Valid IELTS/CELPIP/TEF results less than 2 years old',
      severity: 'critical',
      status: 'pending',
      recommendation: 'Complete language assessment within validity period',
      autoCheck: true
    },
    {
      id: 'edu_assessment',
      category: 'documentation',
      title: 'Educational Credential Assessment',
      description: 'ECA from designated organization for foreign credentials',
      severity: 'critical',
      status: 'pending',
      recommendation: 'Complete ECA through WES, ICES, or other designated organization',
      autoCheck: false
    },
    {
      id: 'work_experience',
      category: 'documentation',
      title: 'Work Experience Documentation',
      description: 'Reference letters for skilled work experience',
      severity: 'high',
      status: 'pending',
      recommendation: 'Obtain detailed reference letters from employers',
      autoCheck: false
    }
  ]
};

const recentPolicyUpdates: PolicyUpdate[] = [
  {
    id: '1',
    title: 'US Student Visa Processing Times Extended',
    description: 'USCIS has announced extended processing times for F-1 visas due to increased applications',
    category: 'processing_times',
    countries: ['US'],
    visaTypes: ['student_visa'],
    effectiveDate: '2024-02-01',
    severity: 'medium',
    source: 'USCIS Official Notice',
    impact: 'Students should apply earlier than usual',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Canada Express Entry CRS Score Changes',
    description: 'New NOC system implementation affects occupation classifications and points allocation',
    category: 'scoring_system',
    countries: ['CA'],
    visaTypes: ['express_entry'],
    effectiveDate: '2024-01-01',
    severity: 'high',
    source: 'IRCC Update',
    impact: 'Candidates should reassess their NOC codes and points',
    createdAt: '2024-01-02'
  }
];

export function ComplianceChecker({ customer, onComplianceUpdate, onPolicyAlert }: ComplianceCheckerProps) {
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [complianceScore, setComplianceScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // Initialize compliance rules based on customer's visa type and destination
    const ruleKey = `${customer.destinationCountry}_${customer.visaType}`;
    const rules = complianceRuleTemplates[ruleKey] || complianceRuleTemplates['US_student_visa'];
    setComplianceRules(rules);
    performComplianceAnalysis(rules);
  }, [customer]);

  const performComplianceAnalysis = async (rules: ComplianceRule[]) => {
    setIsAnalyzing(true);
    
    // Simulate AI-powered compliance analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedRules = rules.map(rule => {
      // Simulate auto-checking based on customer data
      if (rule.autoCheck) {
        const randomStatus = Math.random();
        if (randomStatus > 0.7) {
          return { ...rule, status: 'compliant' as const, completedDate: new Date().toISOString() };
        } else if (randomStatus > 0.4) {
          return { ...rule, status: 'warning' as const };
        } else {
          return { ...rule, status: 'violation' as const };
        }
      }
      return rule;
    });

    setComplianceRules(updatedRules);
    
    // Calculate compliance score
    const totalRules = updatedRules.length;
    const compliantRules = updatedRules.filter(r => r.status === 'compliant').length;
    const warningRules = updatedRules.filter(r => r.status === 'warning').length;
    
    const score = Math.round(((compliantRules + warningRules * 0.5) / totalRules) * 100);
    setComplianceScore(score);
    setLastAnalysis(new Date().toISOString());
    
    setIsAnalyzing(false);
    
    // Trigger callback
    onComplianceUpdate?.(customer.id, score, []);
  };

  const filteredRules = selectedCategory === 'all' 
    ? complianceRules 
    : complianceRules.filter(rule => rule.category === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'violation': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'violation': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Compliance Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Compliance Dashboard</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {customer.name} • {customer.visaType} • {customer.destinationCountry}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => performComplianceAnalysis(complianceRules)}
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mb-2">
                <span className="text-3xl font-bold text-blue-600">{complianceScore}%</span>
              </div>
              <Progress value={complianceScore} className="mb-2" />
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              {lastAnalysis && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(lastAnalysis).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Policy Updates Alert */}
      <AnimatePresence>
        {recentPolicyUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/30">
              <Bell className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-orange-800 dark:text-orange-200">
                    {recentPolicyUpdates.length} recent policy updates may affect this case
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                        View Updates
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Recent Policy Updates</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-96">
                        <div className="space-y-4">
                          {recentPolicyUpdates.map(update => (
                            <div key={update.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">{update.title}</h4>
                                <Badge className={getSeverityColor(update.severity)}>
                                  {update.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {update.description}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                <p>Effective: {new Date(update.effectiveDate).toLocaleDateString()}</p>
                                <p>Impact: {update.impact}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compliance Requirements</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track and manage all compliance requirements for this case
              </p>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="timeline">Timeline</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="background">Background</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="language">Language</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRules.map((rule, index) => {
              const StatusIcon = getStatusIcon(rule.status);
              
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getStatusColor(rule.status)}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{rule.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(rule.severity)}>
                            {rule.severity}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {rule.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {rule.description}
                      </p>
                      
                      {rule.recommendation && rule.status !== 'compliant' && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <Zap className="h-3 w-3 inline mr-1" />
                            {rule.recommendation}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                          {rule.dueDate && (
                            <span>Due: {new Date(rule.dueDate).toLocaleDateString()}</span>
                          )}
                          {rule.completedDate && (
                            <span className="text-green-600">
                              Completed: {new Date(rule.completedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          {rule.status !== 'compliant' && (
                            <Button variant="outline" size="sm">
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Compliant',
            count: complianceRules.filter(r => r.status === 'compliant').length,
            color: 'text-green-600 bg-green-50 border-green-200'
          },
          {
            label: 'Warnings',
            count: complianceRules.filter(r => r.status === 'warning').length,
            color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
          },
          {
            label: 'Violations',
            count: complianceRules.filter(r => r.status === 'violation').length,
            color: 'text-red-600 bg-red-50 border-red-200'
          },
          {
            label: 'Pending',
            count: complianceRules.filter(r => r.status === 'pending').length,
            color: 'text-gray-600 bg-gray-50 border-gray-200'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${stat.color}`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-sm">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
