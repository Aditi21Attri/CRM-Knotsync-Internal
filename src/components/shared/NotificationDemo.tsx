"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bell, User, Mail, MessageCircle, Phone } from "lucide-react";

export function NotificationDemo() {
  const { toast } = useToast();
  const [leadData, setLeadData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    source: 'Website',
  });

  const [reminderData, setReminderData] = useState({
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    customerPhoneNumber: '+1987654321',
    title: 'Follow up on proposal',
    description: 'Discuss pricing and timeline',
    scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
  });
  const testLeadNotification = async () => {
    toast({
      title: "Testing Lead Notification",
      description: "Sending lead notification...",
    });

    try {
      const response = await fetch('/api/notifications/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'lead',
          data: {
            name: leadData.name,
            email: leadData.email,
            phoneNumber: leadData.phoneNumber,
            source: leadData.source,
            assignedTo: {
              id: 'demo-user',
              name: 'Demo Employee',
              email: 'demo@example.com'
            }
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Lead Notification Sent!",
          description: `Notifications sent for ${leadData.name}. Check the console for details.`,
          duration: 5000,
        });
      } else {
        toast({
          title: "❌ Error",
          description: result.error || "Failed to send notification",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to send lead notification",
        variant: "destructive",
      });
    }
  };

  const testReminderNotification = async () => {
    toast({
      title: "Testing Follow-up Reminder",
      description: "Sending follow-up reminder...",
    });

    try {
      const response = await fetch('/api/notifications/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'reminder',
          data: {
            reminder: {
              id: 'demo-reminder',
              ...reminderData,
              createdBy: 'demo-user',
            },
            userEmail: 'demo@example.com',
            userName: 'Demo Employee'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "⏰ Follow-up Reminder Sent!",
          description: `Reminder sent for ${reminderData.customerName}. Check the console for details.`,
          duration: 5000,
        });
      } else {
        toast({
          title: "❌ Error",
          description: result.error || "Failed to send reminder",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to send follow-up reminder",
        variant: "destructive",
      });
    }
  };

  const testBrowserNotification = async () => {
    // Request permission for browser notifications
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('CRM Test Notification', {
          body: 'This is a test browser notification from your CRM system!',
          icon: '/favicon.ico',
          tag: 'crm-test'
        });
        toast({
          title: "🔔 Browser Notification Sent!",
          description: "Check your browser notifications.",
        });
      } else {
        toast({
          title: "❌ Permission Denied",
          description: "Browser notifications are not allowed.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "❌ Not Supported",
        description: "Browser notifications are not supported.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔔 Notification System Demo</h1>
        <p className="text-muted-foreground">
          Test the CRM notification system. Check the browser console for detailed logs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lead Notification Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Lead Notification Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lead-name">Lead Name</Label>
              <Input
                id="lead-name"
                value={leadData.name}
                onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                value={leadData.email}
                onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lead-phone">Phone Number</Label>
              <Input
                id="lead-phone"
                value={leadData.phoneNumber}
                onChange={(e) => setLeadData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lead-source">Source</Label>
              <Select value={leadData.source} onValueChange={(value) => setLeadData(prev => ({ ...prev, source: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={testLeadNotification} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send Lead Notification
            </Button>
          </CardContent>
        </Card>

        {/* Follow-up Reminder Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Follow-up Reminder Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                value={reminderData.customerName}
                onChange={(e) => setReminderData(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="customer-email">Customer Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={reminderData.customerEmail}
                onChange={(e) => setReminderData(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="reminder-title">Reminder Title</Label>
              <Input
                id="reminder-title"
                value={reminderData.title}
                onChange={(e) => setReminderData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="reminder-description">Description</Label>
              <Textarea
                id="reminder-description"
                value={reminderData.description}
                onChange={(e) => setReminderData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <Button onClick={testReminderNotification} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Send Reminder Notification
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Browser Notification Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Browser Notification Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Test browser notifications (requires permission). This simulates what employees would see for follow-up reminders.
          </p>
          <Button onClick={testBrowserNotification}>
            <Bell className="h-4 w-4 mr-2" />
            Test Browser Notification
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 How to Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>1. Lead Notifications:</strong> Fill in the lead details and click "Send Lead Notification". This simulates what happens when a new lead is assigned to an employee.</p>
            <p><strong>2. Follow-up Reminders:</strong> Configure the reminder details and click "Send Reminder Notification". This simulates follow-up notifications for employees.</p>
            <p><strong>3. Browser Notifications:</strong> Click the browser notification button to test desktop notifications.</p>
            <p><strong>4. Check Console:</strong> Open your browser's developer console (F12) to see detailed notification logs.</p>
            <p><strong>5. WhatsApp Integration:</strong> Set your UltraMsg credentials in environment variables or localStorage to test real WhatsApp messages.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
