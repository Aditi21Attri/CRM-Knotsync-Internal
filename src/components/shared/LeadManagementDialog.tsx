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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import type { Lead, LeadStatus } from "@/lib/types";
import { 
  UserCheck, 
  Pause, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  MoreVertical,
  User
} from "lucide-react";
import { 
  convertLeadToCustomer, 
  updateLeadStatus, 
  deleteLeadSoft, 
  deleteLeadHard 
} from "@/lib/actions/leadActions";

const leadActionSchema = z.object({
  action: z.enum(["convert", "hold", "reject", "delete_soft", "delete_hard"]),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type LeadActionFormValues = z.infer<typeof leadActionSchema>;

interface LeadManagementDialogProps {
  lead: Lead;
  onLeadUpdated: (updatedLead?: Lead) => void;
  onLeadDeleted: () => void;
  trigger?: React.ReactNode;
}

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/30 dark:text-blue-300 dark:border-blue-700",
  contacted: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-800/30 dark:text-yellow-300 dark:border-yellow-700",
  qualified: "bg-green-100 text-green-800 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700",
  converted: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-800/30 dark:text-purple-300 dark:border-purple-700",
  on_hold: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-800/30 dark:text-orange-300 dark:border-orange-700",
  rejected: "bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-300 dark:border-red-700",
  deleted: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700",
};

export function LeadManagementDialog({ lead, onLeadUpdated, onLeadDeleted, trigger }: LeadManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { employees } = useData();
  const { toast } = useToast();
  const form = useForm<LeadActionFormValues>({
    resolver: zodResolver(leadActionSchema),
    defaultValues: {
      assignedTo: lead.assignedTo?.id || "unassigned",
      notes: "",
    },
  });

  const selectedAction = form.watch("action");

  const onSubmit = async (data: LeadActionFormValues) => {
    setIsSubmitting(true);
    try {      switch (data.action) {
        case "convert":
          const assignedToId = data.assignedTo === "unassigned" ? undefined : data.assignedTo;
          const convertResult = await convertLeadToCustomer(lead.id, assignedToId);
          if (convertResult.success) {
            toast({
              title: "Lead Converted",
              description: `${lead.name} has been successfully converted to a customer.`,
            });
            onLeadUpdated();
          } else {
            toast({
              title: "Conversion Failed",
              description: convertResult.error || "Failed to convert lead to customer.",
              variant: "destructive",
            });
          }
          break;

        case "hold":
          const holdResult = await updateLeadStatus(lead.id, "on_hold", data.notes);
          if (holdResult.success) {
            toast({
              title: "Lead Put On Hold",
              description: `${lead.name} has been put on hold.`,
            });
            onLeadUpdated(holdResult.lead);
          } else {
            toast({
              title: "Update Failed",
              description: holdResult.error || "Failed to update lead status.",
              variant: "destructive",
            });
          }
          break;

        case "reject":
          const rejectResult = await updateLeadStatus(lead.id, "rejected", data.notes);
          if (rejectResult.success) {
            toast({
              title: "Lead Rejected",
              description: `${lead.name} has been marked as rejected.`,
            });
            onLeadUpdated(rejectResult.lead);
          } else {
            toast({
              title: "Update Failed",
              description: rejectResult.error || "Failed to update lead status.",
              variant: "destructive",
            });
          }
          break;

        case "delete_soft":
          const softDeleteResult = await deleteLeadSoft(lead.id);
          if (softDeleteResult.success) {
            toast({
              title: "Lead Deleted",
              description: `${lead.name} has been marked as deleted.`,
            });
            onLeadDeleted();
          } else {
            toast({
              title: "Deletion Failed",
              description: softDeleteResult.error || "Failed to delete lead.",
              variant: "destructive",
            });
          }
          break;

        case "delete_hard":
          const hardDeleteResult = await deleteLeadHard(lead.id);
          if (hardDeleteResult.success) {
            toast({
              title: "Lead Permanently Deleted",
              description: `${lead.name} has been permanently removed from the system.`,
            });
            onLeadDeleted();
          } else {
            toast({
              title: "Deletion Failed",
              description: hardDeleteResult.error || "Failed to delete lead.",
              variant: "destructive",
            });
          }
          break;
      }
      
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Lead action failed:", error);
      toast({
        title: "Action Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionButtonText = () => {
    switch (selectedAction) {
      case "convert": return "Convert to Customer";
      case "hold": return "Put on Hold";
      case "reject": return "Reject Lead";
      case "delete_soft": return "Mark as Deleted";
      case "delete_hard": return "Permanently Delete";
      default: return "Perform Action";
    }
  };

  const getActionIcon = () => {
    switch (selectedAction) {
      case "convert": return <UserCheck className="h-4 w-4" />;
      case "hold": return <Pause className="h-4 w-4" />;
      case "reject": return <X className="h-4 w-4" />;
      case "delete_soft": return <Trash2 className="h-4 w-4" />;
      case "delete_hard": return <AlertTriangle className="h-4 w-4" />;
      default: return <MoreVertical className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Manage Lead: {lead.name}
          </DialogTitle>
          <DialogDescription>
            Choose an action to perform on this lead
          </DialogDescription>
        </DialogHeader>

        {/* Lead Summary */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{lead.name}</span>
              <Badge variant="outline" className={statusColors[lead.status || 'new']}>
                {(lead.status || 'new').replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Email: {lead.email}</div>
              {lead.phoneNumber && <div>Phone: {lead.phoneNumber}</div>}
              <div>Source: {lead.source}</div>
              {lead.assignedTo && <div>Assigned to: {lead.assignedTo.name}</div>}
            </div>
            {lead.message && (
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">Message:</div>
                <div className="text-foreground italic">"{lead.message}"</div>
              </div>
            )}
          </div>
        </div>

        <Separator />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Action</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose what to do with this lead" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="convert">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          Convert to Customer
                        </div>
                      </SelectItem>
                      <SelectItem value="hold">
                        <div className="flex items-center gap-2">
                          <Pause className="h-4 w-4 text-orange-600" />
                          Put on Hold
                        </div>
                      </SelectItem>
                      <SelectItem value="reject">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-600" />
                          Reject Lead
                        </div>
                      </SelectItem>
                      <SelectItem value="delete_soft">
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4 text-gray-600" />
                          Mark as Deleted
                        </div>
                      </SelectItem>
                      <SelectItem value="delete_hard">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          Permanently Delete
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedAction === "convert" && (
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Customer To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(selectedAction === "hold" || selectedAction === "reject") && (
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={`Add a note about why this lead is being ${selectedAction === "hold" ? "put on hold" : "rejected"}...`}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedAction || isSubmitting}
                variant={selectedAction === "delete_hard" ? "destructive" : "default"}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {getActionIcon()}
                    <span className="ml-2">{getActionButtonText()}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
