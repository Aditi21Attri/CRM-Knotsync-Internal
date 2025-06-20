"use client";
import { useEffect, useState } from "react";
import { getLeadsAssignedTo, updateLeadDetails } from "@/lib/actions/leadActions";
import { useAuth } from "@/contexts/AuthContext";
import type { Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MessageCircle, MessageSquare, Settings, Edit3, Save, X, DollarSign, Calendar, User } from "lucide-react";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedCard } from "@/components/ui/animated-card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeadManagementDialog } from "@/components/shared/LeadManagementDialog";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = ["Hot", "Cold", "Neutral"];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'hot': return 'bg-gradient-to-r from-red-500 to-orange-500';
    case 'cold': return 'bg-gradient-to-r from-blue-400 to-blue-600';
    case 'neutral': return 'bg-gradient-to-r from-gray-400 to-gray-600';
    default: return 'bg-gradient-to-r from-slate-400 to-slate-600';
  }
};

export default function AssignedLeadsPage() {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [editing, setEditing] = useState<{ [leadId: string]: boolean }>({});
  const [form, setForm] = useState<{ [leadId: string]: { status?: string; notes?: string; expectedRevenue?: string } }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      getLeadsAssignedTo(currentUser.id).then((data) => {
        setLeads(data);
        setIsLoading(false);
      });
    }
  }, [currentUser]);

  const handleEdit = (lead: Lead) => {
    setEditing({ ...editing, [lead.id]: true });
    setForm({
      ...form,
      [lead.id]: {
        status: lead.status || "",
        notes: lead.notes || "",
        expectedRevenue: lead.expectedRevenue || "",
      },
    });
  };

  const handleCancel = (leadId: string) => {
    setEditing({ ...editing, [leadId]: false });
    setForm({ ...form, [leadId]: {} });
  };

  const handleChange = (leadId: string, field: string, value: string) => {
    setForm({
      ...form,
      [leadId]: {
        ...form[leadId],
        [field]: value,
      },
    });
  };

  const handleSave = async (leadId: string) => {
    const updated = await updateLeadDetails(leadId, form[leadId]);
    setLeads(leads.map(l => (l.id === leadId && updated ? updated : l)));
    setEditing({ ...editing, [leadId]: false });
  };
  const handleLeadUpdated = (leadId: string, updatedLead?: Lead) => {
    if (updatedLead) {
      setLeads(prevLeads => 
        prevLeads.map(lead => lead.id === leadId ? updatedLead : lead)
      );
    } else {
      // Refresh leads to get updated data
      if (currentUser) {
        getLeadsAssignedTo(currentUser.id).then(setLeads);
      }
    }
  };

  const handleLeadDeleted = (leadId: string) => {
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
  };

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="container mx-auto p-6 space-y-6">        <PageHeader 
          title="My Assigned Leads" 
          description="Manage and track your assigned leads"
        />

        <div className="grid gap-6">
          <AnimatePresence>
            {leads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedCard className="p-6 hover:shadow-lg transition-all duration-300 border border-border/50 backdrop-blur-sm bg-card/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-1">{lead.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center"><Mail className="w-4 h-4 mr-1" />{lead.email}</span>
                          {lead.phoneNumber && (
                            <span className="flex items-center"><Phone className="w-4 h-4 mr-1" />{lead.phoneNumber}</span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(lead.status || '')} text-white`}>
                        {lead.status || 'New'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      {editing[lead.id] ? (
                        <Select
                          value={form[lead.id]?.status || ""}
                          onValueChange={(value) => handleChange(lead.id, "status", value)}
                        >
                          <SelectTrigger className="glass-effect">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 rounded-md bg-muted/30 text-sm">
                          {lead.status || "Not set"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Expected Revenue</label>
                      {editing[lead.id] ? (
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={form[lead.id]?.expectedRevenue || ""}
                            onChange={(e) => handleChange(lead.id, "expectedRevenue", e.target.value)}
                            className="pl-10 glass-effect"
                            placeholder="Enter amount"
                          />
                        </div>
                      ) : (
                        <div className="p-2 rounded-md bg-muted/30 text-sm flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                          {lead.expectedRevenue || "Not set"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                      {editing[lead.id] ? (
                        <Input
                          value={form[lead.id]?.notes || ""}
                          onChange={(e) => handleChange(lead.id, "notes", e.target.value)}
                          className="glass-effect"
                          placeholder="Add notes..."
                        />
                      ) : (
                        <div className="p-2 rounded-md bg-muted/30 text-sm min-h-[2.5rem] flex items-center">
                          {lead.notes || "No notes"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-2">
                      {lead.phoneNumber && (
                        <>
                          <Button size="sm" variant="outline" className="glass-effect" asChild>
                            <a href={`tel:${lead.phoneNumber}`} title="Call">
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" className="glass-effect" asChild>
                            <a href={`sms:${lead.phoneNumber}`} title="SMS">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              SMS
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" className="glass-effect" asChild>
                            <a href={`https://wa.me/${lead.phoneNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              WhatsApp
                            </a>
                          </Button>
                        </>
                      )}
                      {lead.email && (
                        <Button size="sm" variant="outline" className="glass-effect" asChild>
                          <a href={`mailto:${lead.email}`} title="Email">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {editing[lead.id] ? (
                        <>
                          <Button size="sm" onClick={() => handleSave(lead.id)} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleCancel(lead.id)} className="glass-effect">
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(lead)} className="glass-effect">
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <LeadManagementDialog
                            lead={lead}
                            onLeadUpdated={(updatedLead) => handleLeadUpdated(lead.id, updatedLead)}
                            onLeadDeleted={() => handleLeadDeleted(lead.id)}
                            trigger={
                              <Button size="sm" variant="outline" className="glass-effect">
                                <Settings className="w-4 h-4 mr-1" />
                                Actions
                              </Button>
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {leads.length === 0 && (
            <AnimatedCard className="p-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <User className="w-16 h-16 text-muted-foreground" />
                <h3 className="text-xl font-semibold">No Assigned Leads</h3>
                <p className="text-muted-foreground">You don't have any leads assigned to you yet.</p>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}