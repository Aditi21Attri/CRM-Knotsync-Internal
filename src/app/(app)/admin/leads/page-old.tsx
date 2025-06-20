"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadManagementDialog } from "@/components/shared/LeadManagementDialog";
import { NewLeadActionDialog } from "@/components/shared/NewLeadActionDialog";
import { addLeadAction, getLeads } from "@/lib/actions/leadActions";
import { getAllEmployees } from "@/lib/actions/userActions";
import type { Lead, LeadStatus } from "@/lib/types";
import { Phone, Mail, MessageCircle, MessageSquare, Plus, Users, TrendingUp, Clock, Filter } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function LeadCapturePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedHandler, setSelectedHandler] = useState<string>("auto");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [newlyCreatedLead, setNewlyCreatedLead] = useState<Lead | null>(null);
  const [showLeadActionDialog, setShowLeadActionDialog] = useState(false);

  useEffect(() => {
    getLeads().then(setLeads);
    getAllEmployees().then(setEmployees);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let assignedTo = null;
    if (selectedHandler !== "auto") {
      const emp = employees.find(e => e.id === selectedHandler);
      if (emp) assignedTo = { id: emp.id, name: emp.name, email: emp.email };
    }
    const newLead = await addLeadAction({ ...form, source: "website", assignedTo });
    setLeads([newLead, ...leads]);
    setForm({ name: "", email: "", phoneNumber: "", message: "" });
    setSelectedHandler("auto");
    setLoading(false);
    
    // Show lead action dialog for the newly created lead
    setNewlyCreatedLead(newLead);
    setShowLeadActionDialog(true);
  };

  const handleLeadUpdated = (leadId: string, updatedLead?: Lead) => {
    if (updatedLead) {
      setLeads(prevLeads => 
        prevLeads.map(lead => lead.id === leadId ? updatedLead : lead)
      );
    } else {
      // Refresh leads to get updated data
      getLeads().then(setLeads);
    }
  };

  const handleLeadDeleted = (leadId: string) => {
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
  };

  const filteredLeads = useMemo(() => {
    if (statusFilter === "all") return leads;
    return leads.filter(lead => (lead.status || 'new') === statusFilter);
  }, [leads, statusFilter]);

  const leadStats = useMemo(() => {
    const stats = {
      total: leads.length,
      new: leads.filter(l => !l.status || l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      converted: leads.filter(l => l.status === 'converted').length,
      on_hold: leads.filter(l => l.status === 'on_hold').length,
      rejected: leads.filter(l => l.status === 'rejected').length,
    };
    return stats;
  }, [leads]);

  const statusColors: Record<LeadStatus, string> = {
    new: "bg-blue-500",
    contacted: "bg-yellow-500", 
    qualified: "bg-green-500",
    converted: "bg-purple-500",
    on_hold: "bg-orange-500",
    rejected: "bg-red-500",
    deleted: "bg-gray-500",
  };

  // Integration instructions for admin
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/meta-leads` : '/api/webhooks/meta-leads';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management"
        description="Capture and manage leads from various sources"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <div className={`h-3 w-3 rounded-full ${statusColors.new}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <div className={`h-3 w-3 rounded-full ${statusColors.contacted}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.contacted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <div className={`h-3 w-3 rounded-full ${statusColors.qualified}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.qualified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{leadStats.converted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{leadStats.on_hold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <div className={`h-3 w-3 rounded-full ${statusColors.rejected}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">All Leads</TabsTrigger>
          <TabsTrigger value="add-lead">Add New Lead</TabsTrigger>
          <TabsTrigger value="integration">Integration Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
              className="border rounded px-3 py-2 text-sm"
              title="Filter leads by status"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="on_hold">On Hold</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leads ({filteredLeads.length})</CardTitle>
              <CardDescription>
                Manage and track your leads through the conversion process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Quick Actions</TableHead>
                    <TableHead>Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          {lead.message && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              "{lead.message}"
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{lead.email}</div>
                          {lead.phoneNumber && (
                            <div className="text-sm text-muted-foreground">{lead.phoneNumber}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${
                            lead.status === 'converted' ? 'border-green-300 bg-green-50 text-green-800 dark:bg-green-800/30 dark:text-green-300' :
                            lead.status === 'on_hold' ? 'border-orange-300 bg-orange-50 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300' :
                            lead.status === 'rejected' ? 'border-red-300 bg-red-50 text-red-800 dark:bg-red-800/30 dark:text-red-300' :
                            'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300'
                          }`}
                        >
                          {(lead.status || 'new').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {lead.assignedTo?.name || "Unassigned"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(parseISO(lead.createdAt), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {lead.phoneNumber && (
                            <Button size="icon" variant="ghost" asChild>
                              <a href={`tel:${lead.phoneNumber}`} title="Call">
                                <Phone className="h-4 w-4 text-blue-600" />
                              </a>
                            </Button>
                          )}
                          {lead.phoneNumber && (
                            <Button size="icon" variant="ghost" asChild>
                              <a href={`sms:${lead.phoneNumber}`} title="SMS">
                                <MessageCircle className="h-4 w-4 text-green-600" />
                              </a>
                            </Button>
                          )}
                          {lead.email && (
                            <Button size="icon" variant="ghost" asChild>
                              <a href={`mailto:${lead.email}`} title="Email">
                                <Mail className="h-4 w-4 text-purple-600" />
                              </a>
                            </Button>
                          )}
                          {lead.phoneNumber && (
                            <Button size="icon" variant="ghost" asChild>
                              <a 
                                href={`https://wa.me/${lead.phoneNumber.replace(/\D/g, "")}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                title="WhatsApp"
                              >
                                <MessageSquare className="h-4 w-4 text-green-700" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <LeadManagementDialog
                          lead={lead}
                          onLeadUpdated={(updatedLead) => handleLeadUpdated(lead.id, updatedLead)}
                          onLeadDeleted={() => handleLeadDeleted(lead.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No leads found matching the current filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-lead" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Lead
              </CardTitle>
              <CardDescription>
                Manually add a new lead to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <Input 
                  name="name" 
                  placeholder="Full Name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                />
                <Input 
                  name="email" 
                  type="email"
                  placeholder="Email Address" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                />
                <Input 
                  name="phoneNumber" 
                  placeholder="Phone Number" 
                  value={form.phoneNumber} 
                  onChange={handleChange} 
                />
                <textarea
                  name="message"
                  placeholder="Message or inquiry details"
                  value={form.message}
                  onChange={handleChange}
                  className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
                <div>
                  <label className="block font-semibold mb-2">Assign Handler</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={selectedHandler}
                    onChange={e => setSelectedHandler(e.target.value)}
                    title="Select employee to handle this lead"
                  >
                    <option value="auto">Auto-Assign (Round Robin)</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Adding Lead..." : "Add Lead"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Setup</CardTitle>
              <CardDescription>
                Configure webhook endpoints for automatic lead capture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Meta/Facebook Ads Webhook URL</h3>
                <code className="block p-2 bg-muted rounded text-sm break-all">
                  {webhookUrl}
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure this URL in your Meta Ads Manager to automatically capture leads.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>      </Tabs>
        {/* Lead Action Dialog for newly created leads */}
      {newlyCreatedLead && (
        <NewLeadActionDialog
          lead={newlyCreatedLead}
          open={showLeadActionDialog}
          onClose={() => {
            setNewlyCreatedLead(null);
            setShowLeadActionDialog(false);
          }}
          onLeadUpdated={(updatedLead) => {
            if (updatedLead) {
              handleLeadUpdated(newlyCreatedLead.id, updatedLead);
            }
            setNewlyCreatedLead(null);
            setShowLeadActionDialog(false);
          }}
          onLeadDeleted={() => {
            handleLeadDeleted(newlyCreatedLead.id);
            setNewlyCreatedLead(null);
            setShowLeadActionDialog(false);
          }}
        />
      )}
    </div>
  );
}
