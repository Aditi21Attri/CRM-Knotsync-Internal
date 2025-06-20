"use client";

import { useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getDueFollowUpReminders, markReminderNotificationSent } from '@/lib/actions/followUpActions';
import { sendFollowUpReminderNotification } from '@/lib/notifications';
import type { FollowUpReminder } from '@/lib/types';

// Hook to check for due follow-up reminders
export function useFollowUpNotifications() {
  const { employees } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const checkForDueReminders = useCallback(async () => {
    try {
      const dueReminders = await getDueFollowUpReminders();
      
      for (const reminder of dueReminders) {
        // Find the user who created this reminder
        const creator = employees.find(emp => emp.id === reminder.createdBy);
        if (creator) {
          // Send notification
          await sendFollowUpReminderNotification({
            reminder,
            userEmail: creator.email,
            userName: creator.name,
          });

          // Mark notification as sent
          await markReminderNotificationSent(reminder.id);

          // Show in-app notification if this is for the current user
          if (currentUser && reminder.createdBy === currentUser.id) {
            toast({
              title: "Follow-up Reminder",
              description: `Time to follow up with ${reminder.customerName}: ${reminder.title}`,
              duration: 8000,
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to check for due reminders:', error);
    }
  }, [employees, currentUser, toast]);

  useEffect(() => {
    // Check immediately
    checkForDueReminders();

    // Set up interval to check every minute
    const interval = setInterval(checkForDueReminders, 60 * 1000);

    return () => clearInterval(interval);
  }, [checkForDueReminders]);

  return {
    checkForDueReminders,
  };
}

// Component to show notification badge for pending reminders
export function useReminderBadge() {
  const { followUpReminders } = useData();
  const { currentUser } = useAuth();

  const pendingCount = followUpReminders.filter(reminder => 
    currentUser && 
    reminder.createdBy === currentUser.id && 
    reminder.status === 'pending'
  ).length;

  const overdueCount = followUpReminders.filter(reminder => 
    currentUser && 
    reminder.createdBy === currentUser.id && 
    reminder.status === 'pending' &&
    new Date(reminder.scheduledFor) < new Date()
  ).length;

  return {
    pendingCount,
    overdueCount,
    hasOverdue: overdueCount > 0,
    hasPending: pendingCount > 0,
  };
}
