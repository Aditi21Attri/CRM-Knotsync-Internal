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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  User,
  Sparkles
} from "lucide-react";
import { 
  convertLeadToCustomer, 
  updateLeadStatus, 
  deleteLeadSoft, 
  deleteLeadHard 
} from "@/lib/actions/leadActions";

const newLeadActionSchema = z.object({
  action: z.enum(["convert", "hold", "reject", "delete_soft", "keep_as_lead"]),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type NewLeadActionFormValues = z.infer<typeof newLeadActionSchema>;

interface NewLeadActionDialogProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onLeadUpdated: (updatedLead?: Lead) => void;
  onLeadDeleted: () => void;
}

export function NewLeadActionDialog({ 
  lead, 
  open, 
  onClose, 
  onLeadUpdated, 
  onLeadDeleted 
}: NewLeadActionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { employees } = useData();
  const { toast } = useToast();
  const form = useForm<NewLeadActionFormValues>({
    resolver: zodResolver(newLeadActionSchema),
    defaultValues: {
      action: "keep_as_lead",
      assignedTo: lead.assignedTo?.id || "unassigned",
      notes: "",
    },
  });

  const selectedAction = form.watch("action");

  const onSubmit = async (data: NewLeadActionFormValues) => {
    if (data.action === "keep_as_lead") {
      // Just close the dialog, no action needed
      onClose();
      return;
    }

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
            onLeadUpdated(convertResult.customer as unknown as Lead);
          } else {
            throw new Error(convertResult.error || "Failed to convert lead");
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
            throw new Error(holdResult.error || "Failed to put lead on hold");
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
            throw new Error(rejectResult.error || "Failed to reject lead");
          }
          break;

        case "delete_soft":
          const deleteResult = await deleteLeadSoft(lead.id);
          if (deleteResult.success) {
            toast({
              title: "Lead Deleted",
              description: `${lead.name} has been deleted.`,
              variant: "destructive",
            });
            onLeadDeleted();
          } else {
            throw new Error(deleteResult.error || "Failed to delete lead");
          }
          break;

        default:
          throw new Error("Invalid action selected");
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "convert":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case "hold":
        return <Pause className="h-4 w-4 text-orange-600" />;
      case "reject":
        return <X className="h-4 w-4 text-red-600" />;
      case "delete_soft":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case "keep_as_lead":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case "convert":
        return "Convert this lead to a customer and add them to your customer database.";
      case "hold":
        return "Put this lead on hold for later follow-up.";
      case "reject":
        return "Mark this lead as rejected (not interested or not qualified).";
      case "delete_soft":
        return "Delete this lead from the active list (can be recovered later).";
      case "keep_as_lead":
        return "Keep this lead in the system for normal processing.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            New Lead Created Successfully!
          </DialogTitle>
          <DialogDescription>
            What would you like to do with this lead? You can take immediate action or keep it for later processing.
          </DialogDescription>
        </DialogHeader>

        {/* Lead Info */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="font-semibold text-lg">{lead.name}</div>
          <div className="text-sm text-muted-foreground">{lead.email}</div>
          {lead.phoneNumber && (
            <div className="text-sm text-muted-foreground">{lead.phoneNumber}</div>
          )}
          {lead.message && (
            <div className="text-sm">
              <span className="font-medium">Message:</span> {lead.message}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {lead.source}
            </Badge>
            {lead.assignedTo && (
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {lead.assignedTo.name}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Action</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>                    <SelectContent>
                      <SelectItem value="keep_as_lead">
                        Keep as Lead
                      </SelectItem>
                      <SelectItem value="convert">
                        Convert to Customer
                      </SelectItem>
                      <SelectItem value="hold">
                        Put on Hold
                      </SelectItem>
                      <SelectItem value="reject">
                        Mark as Rejected
                      </SelectItem>
                      <SelectItem value="delete_soft">
                        Delete Lead
                      </SelectItem>
                    </SelectContent>
                  </Select>                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {getActionIcon(selectedAction)}
                    {getActionDescription(selectedAction)}
                  </div>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>                      <SelectContent>
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
                    <FormLabel>
                      Notes {selectedAction === "reject" ? "(Optional)" : "(Required for hold)"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          selectedAction === "hold" 
                            ? "Reason for putting on hold..." 
                            : "Reason for rejection (optional)..."
                        }
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
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? "Processing..." 
                  : selectedAction === "keep_as_lead" 
                    ? "Keep as Lead" 
                    : "Apply Action"
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
