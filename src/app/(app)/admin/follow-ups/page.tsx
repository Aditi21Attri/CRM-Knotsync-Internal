"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { FollowUpRemindersPanel } from "@/components/shared/FollowUpRemindersPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/contexts/DataContext";
import { Bell, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

export default function FollowUpRemindersPage() {
  const { followUpReminders } = useData();

  const reminderStats = useMemo(() => {
    const now = new Date();
    const stats = {
      total: followUpReminders.length,
      pending: followUpReminders.filter(r => r.status === 'pending').length,
      completed: followUpReminders.filter(r => r.status === 'completed').length,
      overdue: followUpReminders.filter(r => r.status === 'pending' && new Date(r.scheduledFor) < now).length,
    };
    return stats;
  }, [followUpReminders]);

  return (
    <div className="space-y-6">      <PageHeader 
        title="Follow-up Reminders" 
        description="Manage all team follow-up reminders and notifications"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminderStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reminderStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reminderStats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reminderStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 gap-6">
        <FollowUpRemindersPanel showAll={true} maxHeight="600px" />
      </div>
    </div>
  );
}
