"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarIcon, Clock, Bell } from "lucide-react";
import { format, addDays, addHours, startOfTomorrow } from "date-fns";
import { cn } from "@/lib/utils";

const followUpSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduledFor: z.date({
    required_error: "Please select a date and time",
  }),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type FollowUpFormValues = z.infer<typeof followUpSchema>;

interface FollowUpReminderDialogProps {
  customerId: string;
  customerName: string;
  trigger?: React.ReactNode;
}

const quickTimeOptions = [
  { label: "In 1 Hour", value: () => addHours(new Date(), 1) },
  { label: "In 2 Hours", value: () => addHours(new Date(), 2) },
  { label: "Tomorrow 9 AM", value: () => new Date(startOfTomorrow().getTime() + 9 * 60 * 60 * 1000) },
  { label: "In 3 Days", value: () => addDays(new Date(), 3) },
  { label: "Next Week", value: () => addDays(new Date(), 7) },
];

export function FollowUpReminderDialog({ customerId, customerName, trigger }: FollowUpReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
    const { createFollowUpReminder } = useData();
  const { currentUser } = useAuth();

  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      title: `Follow up with ${customerName}`,
      description: "",
      priority: "medium",
    },
  });

  const selectedDate = form.watch("scheduledFor");

  const handleQuickTime = (getDate: () => Date) => {
    const date = getDate();
    form.setValue("scheduledFor", date);
    setSelectedTime(format(date, "HH:mm"));
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      form.setValue("scheduledFor", newDate);
    }
  };
  const onSubmit = async (data: FollowUpFormValues) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      await createFollowUpReminder({
        customerId,
        customerName,
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        title: data.title,
        description: data.description,
        scheduledFor: data.scheduledFor.toISOString(),
        priority: data.priority,
      });
      
      form.reset();
      setOpen(false);
      setSelectedTime("");
    } catch (error) {
      console.error("Failed to create follow-up reminder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Follow Up
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Schedule Follow-up Reminder
          </DialogTitle>
          <DialogDescription>
            Set a reminder to follow up with {customerName}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Title</FormLabel>
                  <FormControl>
                    <Input placeholder="What do you need to follow up about?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this follow-up..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Quick Time Options</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {quickTimeOptions.map((option) => (
                  <Button
                    key={option.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickTime(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date & Time</FormLabel>
                  <div className="flex gap-2">
                    <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              const timeToUse = selectedTime || "09:00";
                              const [hours, minutes] = timeToUse.split(":").map(Number);
                              date.setHours(hours, minutes, 0, 0);
                              field.onChange(date);
                            }
                            setShowDatePicker(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="w-24"
                      />
                    </div>
                  </div>
                  {field.value && (
                    <p className="text-sm text-muted-foreground">
                      Reminder set for: {format(field.value, "PPP 'at' p")}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
