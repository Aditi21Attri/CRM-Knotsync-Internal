'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Mic, MicOff, Volume2, VolumeX, 
  FileText, Calendar, AlertTriangle, CheckCircle,
  Sparkles, Brain, Target, TrendingUp, Globe,
  MessageSquare, BookOpen, Lightbulb, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import type { VisaType, CountryCode, AIRecommendation, ImmigrationCustomer } from '@/lib/types';

interface AIMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  confidence?: number;
  recommendations?: AIRecommendation[];
  attachments?: string[];
  actionable?: boolean;
  metadata?: {
    visaType?: VisaType;
    country?: CountryCode;
    sentiment?: 'positive' | 'neutral' | 'negative';
    intent?: string;
  };
}

interface AIAssistantProps {
  customer?: ImmigrationCustomer;
  onRecommendationApply?: (recommendation: AIRecommendation) => void;
  onActionSuggested?: (action: string, data: any) => void;
}

const AIInsightCard = ({ insight, onApply }: { insight: AIRecommendation; onApply: (insight: AIRecommendation) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
        {insight.type === 'document' && <FileText className="w-4 h-4 text-blue-600" />}
        {insight.type === 'timeline' && <Calendar className="w-4 h-4 text-blue-600" />}
        {insight.type === 'strategy' && <Target className="w-4 h-4 text-blue-600" />}
        {insight.type === 'risk' && <AlertTriangle className="w-4 h-4 text-blue-600" />}
        {insight.type === 'opportunity' && <TrendingUp className="w-4 h-4 text-blue-600" />}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{insight.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={insight.confidence > 80 ? 'default' : insight.confidence > 60 ? 'secondary' : 'outline'}>
            {insight.confidence}% confidence
          </Badge>
          <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
            {insight.impact} impact
          </Badge>
          {!insight.isImplemented && (
            <Button 
              size="sm" 
              onClick={() => onApply(insight)}
              className="ml-auto"
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

export function AIImmigrationAssistant({ customer, onRecommendationApply, onActionSuggested }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello! I'm your AI Immigration Assistant. I can help you with visa applications, document requirements, timeline predictions, and strategic recommendations. ${customer ? `I see you're working with ${customer.name} for a ${customer.visaType} to ${customer.destinationCountry}.` : 'How can I assist you today?'}`,
      timestamp: new Date().toISOString(),
      confidence: 95
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: FileText, label: 'Document Checklist', action: 'generate_document_checklist' },
    { icon: Calendar, label: 'Timeline Prediction', action: 'predict_timeline' },
    { icon: Target, label: 'Success Strategy', action: 'generate_strategy' },
    { icon: AlertTriangle, label: 'Risk Analysis', action: 'analyze_risks' },
    { icon: TrendingUp, label: 'Optimize Process', action: 'optimize_process' },
    { icon: Globe, label: 'Country Info', action: 'country_requirements' }
  ];

  const recentInsights: AIRecommendation[] = [
    {
      id: '1',
      type: 'document',
      title: 'Missing IELTS Certificate',
      description: 'Customer needs IELTS score of 6.5+ for skilled worker visa. Recommend booking test ASAP.',
      confidence: 92,
      impact: 'high',
      createdAt: new Date().toISOString(),
      isImplemented: false
    },
    {
      id: '2',
      type: 'timeline',
      title: 'Expedited Processing Available',
      description: 'Customer qualifies for premium processing. Can reduce wait time by 3-4 months.',
      confidence: 87,
      impact: 'medium',
      createdAt: new Date().toISOString(),
      isImplemented: false
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Job Market Favorable',
      description: 'Current job market in tech sector is excellent. Timing is optimal for application.',
      confidence: 78,
      impact: 'medium',
      createdAt: new Date().toISOString(),
      isImplemented: true
    }
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue, customer),
        timestamp: new Date().toISOString(),
        confidence: Math.floor(Math.random() * 30) + 70,
        recommendations: generateRecommendations(inputValue),
        actionable: true,
        metadata: {
          intent: detectIntent(inputValue),
          sentiment: 'positive'
        }
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: { [key: string]: string } = {
      'generate_document_checklist': 'Generate a comprehensive document checklist for this case',
      'predict_timeline': 'Predict the processing timeline for this application',
      'generate_strategy': 'Suggest the best strategy for this immigration case',
      'analyze_risks': 'Analyze potential risks and challenges for this application',
      'optimize_process': 'Recommend ways to optimize and accelerate the process',
      'country_requirements': 'Show specific requirements for the destination country'
    };

    setInputValue(actionMessages[action] || '');
    setTimeout(() => handleSendMessage(), 100);
  };

  const generateAIResponse = (input: string, customer?: ImmigrationCustomer): string => {
    const responses = [
      `Based on my analysis of similar ${customer?.visaType || 'visa'} cases, I recommend focusing on strengthening your financial documentation. The success rate increases by 23% with comprehensive financial proof.`,
      `I've analyzed the current processing times for ${customer?.destinationCountry || 'your destination country'}. The estimated timeline is 4-6 months, but we can optimize this to 3-4 months with proper preparation.`,
      `Your case profile suggests a 87% success probability. The key factors are: complete documentation (92% ready), language requirements (met), and financial stability (requires minor adjustments).`,
      `I've identified 3 optimization opportunities for your case: 1) Premium processing eligibility, 2) Additional supporting documents, 3) Interview preparation timeline.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateRecommendations = (input: string): AIRecommendation[] => {
    return [
      {
        id: Date.now().toString(),
        type: 'strategy',
        title: 'Recommended Next Steps',
        description: 'Based on your query, I suggest prioritizing document collection and scheduling language test.',
        confidence: 89,
        impact: 'high',
        createdAt: new Date().toISOString(),
        isImplemented: false
      }
    ];
  };

  const detectIntent = (input: string): string => {
    const intents = ['document_inquiry', 'timeline_question', 'strategy_request', 'risk_assessment'];
    return intents[Math.floor(Math.random() * intents.length)];
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };

      recognition.start();
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
            <Bot className="w-5 h-5 text-white" />
          </div>
          AI Immigration Assistant
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  } rounded-lg p-3`}>
                    <p className="text-sm">{message.content}</p>
                    {message.confidence && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={message.confidence} className="h-1 flex-1" />
                        <span className="text-xs opacity-75">{message.confidence}%</span>
                        {message.type === 'ai' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => speakMessage(message.content)}
                          >
                            {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          </Button>
                        )}
                      </div>
                    )}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.recommendations.map((rec) => (
                          <AIInsightCard 
                            key={rec.id} 
                            insight={rec} 
                            onApply={onRecommendationApply || (() => {})} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-6 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about immigration..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                className={isListening ? 'bg-red-100 border-red-300' : ''}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="flex-1 px-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent AI Insights</h3>
              <Badge variant="outline">{recentInsights.length} insights</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {recentInsights.map((insight) => (
                  <AIInsightCard 
                    key={insight.id} 
                    insight={insight} 
                    onApply={onRecommendationApply || (() => {})} 
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="flex-1 px-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.action}
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => handleQuickAction(action.action)}
                >
                  <action.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
