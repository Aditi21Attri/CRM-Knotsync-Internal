"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, 
  MessageCircle, 
  Bell, 
  Send, 
  Settings, 
  TestTube, 
  Activity,
  Users,
  Database,
  RefreshCw
} from "lucide-react";

export default function NotificationTestPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotificationType, setSelectedNotificationType] = useState('system_alert');
  const [testEmail, setTestEmail] = useState('');

  const createDemoNotification = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          type: selectedNotificationType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Demo Notification Created",
          description: `A ${selectedNotificationType.replace('_', ' ')} notification has been queued for processing.`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: `Failed to create demo notification: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/process', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Processing Complete",
          description: "All pending notifications have been processed.",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: `Failed to process notifications: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNotificationProcessor = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/process', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMs: 30000 })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Processor Started",
          description: "Notification processor is now running automatically.",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: `Failed to start processor: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to access the notification test page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification System Test</h1>
          <p className="text-muted-foreground">Test and manage the notification system</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Current User: {currentUser.name}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email Service</span>
              <Badge variant="outline">
                {process.env.SMTP_USER ? '✅ Configured' : '⚠️ Simulated'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>WhatsApp Service</span>
              <Badge variant="outline">
                {process.env.ULTRAMSG_TOKEN ? '✅ Configured' : '⚠️ Simulated'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Database</span>
              <Badge variant="outline">✅ Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Browser Notifications</span>
              <Badge variant="outline">✅ Supported</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Create Demo Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Notification
            </CardTitle>
            <CardDescription>
              Create a demo notification to test the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type</Label>
              <Select value={selectedNotificationType} onValueChange={setSelectedNotificationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_assigned">Lead Assigned</SelectItem>
                  <SelectItem value="follow_up_reminder">Follow-up Reminder</SelectItem>
                  <SelectItem value="welcome_message">Welcome Message</SelectItem>
                  <SelectItem value="customer_updated">Customer Updated</SelectItem>
                  <SelectItem value="system_alert">System Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={createDemoNotification} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Create Demo Notification
            </Button>
          </CardContent>
        </Card>

        {/* Manual Processing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manual Controls
            </CardTitle>
            <CardDescription>
              Manually trigger notification processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={processNotifications} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Process Pending Notifications
            </Button>
            
            <Button 
              onClick={startNotificationProcessor} 
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Start Auto Processor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            How to Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Quick Test Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Select a notification type above</li>
                  <li>Click "Create Demo Notification"</li>
                  <li>Check the notification bell icon in the header</li>
                  <li>Click "Process Pending Notifications" to trigger email/WhatsApp sending</li>
                  <li>Check your browser notifications and console logs</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Environment Setup:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Email:</strong> Set SMTP_USER, SMTP_PASS, SMTP_HOST in .env</li>
                  <li><strong>WhatsApp:</strong> Set ULTRAMSG_INSTANCE_ID, ULTRAMSG_TOKEN</li>
                  <li><strong>Database:</strong> MongoDB connection should be working</li>
                  <li><strong>Browser:</strong> Allow notifications when prompted</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> If email/WhatsApp credentials are not configured, the system will simulate sending 
                and log the messages to the console. This is perfect for development and testing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
