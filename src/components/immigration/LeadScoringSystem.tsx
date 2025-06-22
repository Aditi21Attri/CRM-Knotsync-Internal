'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, TrendingUp, Brain, Zap, Users, Globe,
  Star, Award, AlertTriangle, CheckCircle, Filter,
  Search, RefreshCw, Download, Eye, Settings,
  Calendar, DollarSign, MapPin, GraduationCap,
  Briefcase, Heart, Clock, Phone, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { ImmigrationCustomer, VisaType, CountryCode, Priority } from '@/lib/types';

interface LeadScoringProps {
  customers: ImmigrationCustomer[];
  onScoreUpdate?: (customerId: string, score: number, factors: ScoringFactor[]) => void;
  onLeadAssign?: (customerId: string, priority: Priority) => void;
}

interface ScoringFactor {
  category: 'demographic' | 'financial' | 'timeline' | 'documents' | 'engagement' | 'referral';
  factor: string;
  weight: number;
  score: number;
  maxScore: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface ScoringRule {
  id: string;
  name: string;
  category: string;
  weight: number;
  enabled: boolean;
  logic: string;
  description: string;
}

interface LeadScore {
  customerId: string;
  totalScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  priority: Priority;
  factors: ScoringFactor[];
  conversionProbability: number;
  recommendedActions: string[];
  lastUpdated: string;
}

const defaultScoringRules: ScoringRule[] = [
  {
    id: 'age_optimal',
    name: 'Optimal Age Range',
    category: 'demographic',
    weight: 15,
    enabled: true,
    logic: 'age >= 25 && age <= 35',
    description: 'Candidates in optimal age range for immigration'
  },
  {
    id: 'education_level',
    name: 'Education Level',
    category: 'demographic',
    weight: 20,
    enabled: true,
    logic: 'education === "masters" || education === "phd"',
    description: 'Higher education increases approval chances'
  },
  {
    id: 'financial_capacity',
    name: 'Financial Capacity',
    category: 'financial',
    weight: 25,
    enabled: true,
    logic: 'totalFees <= paidAmount * 0.5',
    description: 'Strong financial position indicates serious intent'
  },
  {
    id: 'language_proficiency',
    name: 'Language Test Score',
    category: 'documents',
    weight: 15,
    enabled: true,
    logic: 'ieltsScore >= 7.0 || toeflScore >= 100',
    description: 'High language scores improve visa success rate'
  },
  {
    id: 'timeline_urgency',
    name: 'Application Timeline',
    category: 'timeline',
    weight: 10,
    enabled: true,
    logic: 'daysUntilDeadline >= 90 && daysUntilDeadline <= 180',
    description: 'Optimal timeline for thorough preparation'
  },
  {
    id: 'engagement_level',
    name: 'Client Engagement',
    category: 'engagement',
    weight: 10,
    enabled: true,
    logic: 'responseTime <= 24 && documentSubmissionRate >= 0.8',
    description: 'Highly engaged clients have better outcomes'
  },
  {
    id: 'referral_source',
    name: 'Referral Quality',
    category: 'referral',
    weight: 5,
    enabled: true,
    logic: 'referralSource === "existing_client" || referralSource === "agent"',
    description: 'Quality referrals indicate higher conversion probability'
  }
];

export function LeadScoringSystem({ customers, onScoreUpdate, onLeadAssign }: LeadScoringProps) {
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(defaultScoringRules);
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');  const [sortBy, setSortBy] = useState<'score' | 'probability' | 'updated'>('score');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showRulesConfig, setShowRulesConfig] = useState(false);

  // Define the scoring function first
  const calculateCustomerScore = useCallback((customer: ImmigrationCustomer, rules: ScoringRule[]): LeadScore => {
    const factors: ScoringFactor[] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Mock data for demonstration - in real implementation, these would be calculated from actual customer data
    const mockData = {
      age: Math.floor(Math.random() * 20) + 25, // 25-45
      education: ['bachelors', 'masters', 'phd'][Math.floor(Math.random() * 3)],
      ieltsScore: Math.random() * 4 + 5, // 5-9
      toeflScore: Math.random() * 40 + 80, // 80-120
      daysUntilDeadline: Math.floor(Math.random() * 365) + 30,
      responseTime: Math.floor(Math.random() * 72) + 1, // 1-72 hours
      documentSubmissionRate: Math.random(),
      referralSource: ['website', 'existing_client', 'agent', 'social_media'][Math.floor(Math.random() * 4)]
    };

    rules.forEach(rule => {
      if (!rule.enabled) return;

      let score = 0;
      let maxScore = rule.weight;
      let impact: 'positive' | 'negative' | 'neutral' = 'neutral';

      // Simplified scoring logic - in real implementation, this would be more sophisticated
      switch (rule.id) {
        case 'age_optimal':
          score = (mockData.age >= 25 && mockData.age <= 35) ? rule.weight : rule.weight * 0.5;
          impact = score === rule.weight ? 'positive' : 'neutral';
          break;
        case 'education_level':
          score = mockData.education === 'phd' ? rule.weight : 
                 mockData.education === 'masters' ? rule.weight * 0.8 :
                 rule.weight * 0.6;
          impact = score >= rule.weight * 0.8 ? 'positive' : 'neutral';
          break;
        case 'financial_capacity':
          const paymentRatio = customer.paidAmount / customer.totalFees;
          score = paymentRatio >= 0.5 ? rule.weight : 
                 paymentRatio >= 0.3 ? rule.weight * 0.7 :
                 rule.weight * 0.3;
          impact = score >= rule.weight * 0.7 ? 'positive' : 'neutral';
          break;
        case 'language_proficiency':
          score = (mockData.ieltsScore >= 7.0 || mockData.toeflScore >= 100) ? 
                 rule.weight : rule.weight * 0.6;
          impact = score === rule.weight ? 'positive' : 'neutral';
          break;
        case 'timeline_urgency':
          score = (mockData.daysUntilDeadline >= 90 && mockData.daysUntilDeadline <= 180) ? 
                 rule.weight : rule.weight * 0.7;
          impact = score === rule.weight ? 'positive' : 'neutral';
          break;
        case 'engagement_level':
          score = (mockData.responseTime <= 24 && mockData.documentSubmissionRate >= 0.8) ? 
                 rule.weight : rule.weight * 0.5;
          impact = score === rule.weight ? 'positive' : 'neutral';
          break;
        case 'referral_source':
          score = ['existing_client', 'agent'].includes(mockData.referralSource) ? 
                 rule.weight : rule.weight * 0.3;
          impact = score === rule.weight ? 'positive' : 'neutral';
          break;
      }

      factors.push({
        category: rule.category as any,
        factor: rule.name,
        weight: rule.weight,
        score,
        maxScore,
        description: rule.description,
        impact
      });

      totalScore += score;
      maxPossibleScore += maxScore;
    });

    const normalizedScore = (totalScore / maxPossibleScore) * 100;
    const grade = getGrade(normalizedScore);
    const priority = getPriority(normalizedScore);
    const conversionProbability = Math.min(normalizedScore + Math.random() * 10, 100);

    const recommendedActions = generateRecommendations(factors, normalizedScore);    return {
      customerId: customer.id,
      totalScore: normalizedScore,
      grade,
      priority,
      factors,
      conversionProbability,
      recommendedActions,
      lastUpdated: new Date().toISOString()
    };
  }, []);

  // Initialize scores when component mounts or customers change
  useEffect(() => {
    if (customers.length > 0) {
      const initialScores = customers.map(customer => calculateCustomerScore(customer, scoringRules));
      setLeadScores(initialScores);
    }
  }, [customers, calculateCustomerScore, scoringRules]);

  const getGrade = (score: number): LeadScore['grade'] => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    return 'D';
  };

  const getPriority = (score: number): Priority => {
    if (score >= 80) return 'urgent';
    if (score >= 65) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
  };

  const generateRecommendations = (factors: ScoringFactor[], score: number): string[] => {
    const recommendations: string[] = [];

    if (score >= 80) {
      recommendations.push('Priority lead - Schedule immediate consultation');
      recommendations.push('Fast-track documentation process');
    } else if (score >= 60) {
      recommendations.push('Strong candidate - Follow up within 24 hours');
      recommendations.push('Provide detailed timeline and next steps');
    } else {
      recommendations.push('Nurture lead with educational content');
      recommendations.push('Address documentation gaps');
    }

    factors.forEach(factor => {
      if (factor.impact === 'negative' || factor.score < factor.maxScore * 0.5) {
        switch (factor.category) {
          case 'financial':
            recommendations.push('Discuss payment plan options');
            break;
          case 'documents':
            recommendations.push('Provide document preparation assistance');
            break;
          case 'timeline':
            recommendations.push('Review timeline expectations');
            break;
          case 'engagement':
            recommendations.push('Improve communication frequency');
            break;
        }
      }
    });

    return [...new Set(recommendations)].slice(0, 4); // Remove duplicates and limit to 4
  };

  const filteredLeads = leadScores.filter(lead => {
    const customer = customers.find(c => c.id === lead.customerId);
    if (!customer) return false;

    if (searchTerm && !customer.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedGrade !== 'all' && lead.grade !== selectedGrade) {
      return false;
    }
    if (selectedPriority !== 'all' && lead.priority !== selectedPriority) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'probability':
        return b.conversionProbability - a.conversionProbability;
      case 'updated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return b.totalScore - a.totalScore;
    }
  });
  const recalculateScores = async () => {
    setIsCalculating(true);
    // Simulate calculation time
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newScores = customers.map(customer => calculateCustomerScore(customer, scoringRules));
    setLeadScores(newScores);
    setIsCalculating(false);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': return 'bg-green-100 text-green-800 border-green-300';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C+': case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const averageScore = leadScores.length > 0 ? 
    leadScores.reduce((sum, lead) => sum + lead.totalScore, 0) / leadScores.length : 0;

  const highQualityLeads = leadScores.filter(lead => lead.totalScore >= 70).length;
  const conversionReady = leadScores.filter(lead => lead.conversionProbability >= 80).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">AI Lead Scoring System</h1>
          <p className="text-muted-foreground">
            Intelligent lead prioritization for immigration consultancy
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowRulesConfig(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
          
          <Button 
            onClick={recalculateScores}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {isCalculating ? 'Calculating...' : 'Recalculate Scores'}
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Average Score
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {averageScore.toFixed(1)}
                </p>
                <Progress value={averageScore} className="mt-2 h-2" />
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  High Quality Leads
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {highQualityLeads}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Score ≥ 70
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Conversion Ready
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {conversionReady}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Probability ≥ 80%
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Urgent Actions
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {leadScores.filter(lead => lead.priority === 'urgent').length}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Require immediate attention
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lead Scores</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C+">C+</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="probability">Conversion Probability</SelectItem>
                  <SelectItem value="updated">Last Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.map((lead, index) => {
              const customer = customers.find(c => c.id === lead.customerId);
              if (!customer) return null;

              return (
                <motion.div
                  key={lead.customerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{customer.name}</h3>
                          <Badge className={getGradeColor(lead.grade)}>
                            Grade {lead.grade}
                          </Badge>
                          <Badge className={getPriorityColor(lead.priority)}>
                            {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {customer.destinationCountry}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {customer.visaType.replace('_', ' ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${customer.totalFees.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {lead.totalScore.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {lead.conversionProbability.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Conversion</div>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Lead Scoring Details - {customer.name}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-96">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Score Breakdown</h4>
                                    <div className="space-y-2">
                                      {lead.factors.map((factor, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                          <span>{factor.factor}</span>
                                          <div className="flex items-center gap-2">
                                            <span>{factor.score.toFixed(1)}/{factor.maxScore}</span>
                                            <div className={`w-2 h-2 rounded-full ${
                                              factor.impact === 'positive' ? 'bg-green-500' :
                                              factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                                            }`} />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Recommended Actions</h4>
                                    <ul className="space-y-1 text-sm">
                                      {lead.recommendedActions.map((action, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                          {action}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm"
                          onClick={() => onLeadAssign?.(lead.customerId, lead.priority)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Score Progress: {lead.totalScore.toFixed(0)}/100
                      </span>
                      <span className="text-muted-foreground">
                        Last updated: {new Date(lead.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <Progress value={lead.totalScore} className="mt-1 h-2" />
                  </div>

                  {lead.recommendedActions.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Next Best Action:
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {lead.recommendedActions[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leads found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules Configuration Dialog */}
      <Dialog open={showRulesConfig} onOpenChange={setShowRulesConfig}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Lead Scoring Rules Configuration</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {scoringRules.map((rule, index) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={rule.enabled}
                        onCheckedChange={(checked) => {
                          const newRules = [...scoringRules];
                          newRules[index].enabled = checked;
                          setScoringRules(newRules);
                        }}
                      />
                      <h4 className="font-semibold">{rule.name}</h4>
                      <Badge variant="outline">{rule.category}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Weight: {rule.weight}%
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {rule.description}
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Weight (%)</label>
                    <Slider
                      value={[rule.weight]}
                      onValueChange={(value) => {
                        const newRules = [...scoringRules];
                        newRules[index].weight = value[0];
                        setScoringRules(newRules);
                      }}
                      max={50}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRulesConfig(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              recalculateScores();
              setShowRulesConfig(false);
            }}>
              Apply Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
