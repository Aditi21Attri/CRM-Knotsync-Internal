"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import type { FollowUpReminder, FollowUpStatus } from "@/lib/types";
import { Bell, Clock, CheckCircle2, X, AlertTriangle, User, Calendar } from "lucide-react";
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors: Record<FollowUpStatus, string> = {
  pending: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/30 dark:text-blue-300 dark:border-blue-700",
  completed: "bg-green-100 text-green-800 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700",
  overdue: "bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-300 dark:border-red-700",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300",
};

interface FollowUpRemindersPanelProps {
  showAll?: boolean; // Show all reminders or just user's own reminders
  customerId?: string; // Show reminders for specific customer
  maxHeight?: string;
}

export function FollowUpRemindersPanel({ showAll = false, customerId, maxHeight = "400px" }: FollowUpRemindersPanelProps) {  const { followUpReminders, updateReminderStatus, deleteReminder, refreshReminders } = useData();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const filteredReminders = followUpReminders.filter((reminder) => {
    if (customerId) {
      return reminder.customerId === customerId;
    }
    if (!showAll && currentUser) {
      return reminder.createdBy === currentUser.id;
    }
    return true;
  });

  const sortedReminders = filteredReminders.sort((a, b) => {
    // Sort by status (pending first), then by scheduled time
    if (a.status !== b.status) {
      const statusOrder = ['overdue', 'pending', 'completed', 'cancelled'];
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    }
    return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
  });

  const handleStatusUpdate = async (reminderId: string, status: FollowUpStatus) => {
    setLoading(true);
    try {
      await updateReminderStatus(reminderId, status);
      await refreshReminders();
    } catch (error) {
      console.error("Failed to update reminder status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    setLoading(true);
    try {
      await deleteReminder(reminderId);
      await refreshReminders();
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatScheduledTime = (dateString: string) => {
    const date = parseISO(dateString);
    const now = new Date();
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    }
  };

  const getTimeStatus = (dateString: string, status: FollowUpStatus) => {
    if (status === 'completed' || status === 'cancelled') return null;
    
    const date = parseISO(dateString);
    if (isPast(date)) {
      return 'overdue';
    } else if (isToday(date)) {
      return 'today';
    } else if (isTomorrow(date)) {
      return 'tomorrow';
    }
    return 'upcoming';
  };

  if (sortedReminders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {customerId ? "No reminders for this customer" : "No follow-up reminders"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Follow-up Reminders
            </CardTitle>
            <CardDescription>
              {customerId ? "Reminders for this customer" : showAll ? "All team reminders" : "Your reminders"}
            </CardDescription>
          </div>
          <Badge variant="secondary">{sortedReminders.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ height: maxHeight }}>
          <div className="p-4 space-y-3">
            {sortedReminders.map((reminder, index) => {
              const timeStatus = getTimeStatus(reminder.scheduledFor, reminder.status);
              const isOverdue = timeStatus === 'overdue';
              const isToday = timeStatus === 'today';
              
              return (
                <div key={reminder.id}>
                  <div className={`p-3 rounded-lg border transition-colors ${
                    isOverdue ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50' :
                    isToday ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50' :
                    'border-border bg-card'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{reminder.title}</h4>
                          {reminder.priority && (
                            <Badge variant="outline" className={`text-xs ${priorityColors[reminder.priority]}`}>
                              {reminder.priority}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{reminder.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className={isOverdue ? 'text-red-600 dark:text-red-400' : isToday ? 'text-yellow-600 dark:text-yellow-400' : ''}>
                              {formatScheduledTime(reminder.scheduledFor)}
                            </span>
                            {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          </div>
                          {showAll && (
                            <div className="flex items-center gap-1">
                              <span>Created by: {reminder.createdByName}</span>
                            </div>
                          )}
                        </div>
                        
                        {reminder.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {reminder.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className={statusColors[reminder.status]}>
                          {reminder.status}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="sr-only">Actions</span>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {reminder.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(reminder.id, 'completed')}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {(reminder.status === 'pending' || reminder.status === 'overdue') && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(reminder.id, 'cancelled')}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  {index < sortedReminders.length - 1 && <Separator className="mt-3" />}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
