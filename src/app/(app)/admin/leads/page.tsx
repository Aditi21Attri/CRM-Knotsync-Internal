"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addLeadAction, getLeads, convertLeadToCustomer, updateLeadStatus, deleteLeadSoft } from "@/lib/actions/leadActions";
import { getAllEmployees } from "@/lib/actions/userActions";
import type { Lead, LeadStatus, LeadSource } from "@/lib/types";
import { Phone, Mail, MessageCircle, MessageSquare, Plus, Users, TrendingUp, Clock, Filter, Eye, User2, CheckCircle, XCircle, Trash2, Pause, AlertTriangle, UserCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const statusColors = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  qualified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  unqualified: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  lost: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  deleted: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  on_hold: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AllLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHardDeleteDialog, setShowHardDeleteDialog] = useState(false);
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; name: string; email: string }[]>([]);
  const [convertData, setConvertData] = useState({ assignedEmployeeId: "auto" });
  const [updateData, setUpdateData] = useState({ status: "", notes: "" });  const [newLeadData, setNewLeadData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    message: "",
    source: "other" as LeadSource,
    assignedTo: "auto"
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, employeesData] = await Promise.all([
        getLeads(),
        getAllEmployees()
      ]);
      setLeads(leadsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load leads data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (lead.phoneNumber && lead.phoneNumber.includes(searchTerm));
      return matchesStatus && matchesSearch;
    });
  }, [leads, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === "new").length;
    const qualified = leads.filter(l => l.status === "qualified").length;
    const converted = leads.filter(l => l.status === "converted").length;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0";

    return { total, newLeads, qualified, converted, conversionRate };
  }, [leads]);

  const handleConvertToCustomer = async () => {
    if (!selectedLead) return;

    try {
      const assignedEmployeeId = convertData.assignedEmployeeId === "auto" ? null : convertData.assignedEmployeeId;
      const result = await convertLeadToCustomer(selectedLead.id, assignedEmployeeId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Lead converted to customer successfully",
        });
        setShowConvertDialog(false);
        setSelectedLead(null);
        await loadData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to convert lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to convert lead:', error);
      toast({
        title: "Error",
        description: "Failed to convert lead to customer",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedLead || !updateData.status) return;

    try {
      const result = await updateLeadStatus(selectedLead.id, updateData.status as LeadStatus, updateData.notes);
      if (result.success) {
        toast({
          title: "Success",
          description: "Lead status updated successfully",
        });
        setShowUpdateDialog(false);
        setSelectedLead(null);
        await loadData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };
  const handleDeleteLead = async (leadId: string) => {
    try {
      const result = await deleteLeadSoft(leadId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Lead deleted successfully",
        });
        await loadData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  const handleAddLead = async () => {
    try {
      if (!newLeadData.name || !newLeadData.email) {
        toast({
          title: "Error",
          description: "Name and email are required",
          variant: "destructive",
        });
        return;
      }      const assignedTo = newLeadData.assignedTo && newLeadData.assignedTo !== "auto"
        ? employees.find(emp => emp.id === newLeadData.assignedTo) || null
        : null;

      const result = await addLeadAction({
        name: newLeadData.name,
        email: newLeadData.email,
        phoneNumber: newLeadData.phoneNumber || undefined,
        message: newLeadData.message || undefined,
        source: newLeadData.source,
        assignedTo
      });

      toast({
        title: "Success",
        description: "Lead added successfully",
      });

      setShowAddLeadDialog(false);      setNewLeadData({
        name: "",
        email: "",
        phoneNumber: "",
        message: "",
        source: "other",
        assignedTo: "auto"
      });
      await loadData();
    } catch (error) {      console.error('Failed to add lead:', error);
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive",
      });
    }
  };

  const handleHoldLead = async (leadId: string) => {
    try {
      const result = await updateLeadStatus(leadId, 'on_hold', 'Lead put on hold');
      if (result.success) {
        toast({
          title: "Success",
          description: "Lead put on hold successfully",
        });
        await loadData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to put lead on hold",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to put lead on hold:', error);
      toast({
        title: "Error",
        description: "Failed to put lead on hold",
        variant: "destructive",
      });
    }
  };

  const handleHardDeleteLead = async () => {
    if (!selectedLead) return;

    try {
      // Import the hard delete function
      const { deleteLeadHard } = await import('@/lib/actions/leadActions');
      const result = await deleteLeadHard(selectedLead.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Lead permanently deleted",
        });
        setShowHardDeleteDialog(false);
        setSelectedLead(null);
        await loadData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete lead permanently",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to permanently delete lead:', error);
      toast({
        title: "Error",
        description: "Failed to permanently delete lead",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </AnimatedPage>
    );
  }
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="All Leads"
            description="Manage and track all leads in your pipeline"
          />
          <div className="flex gap-2">
            <AnimatedButton asChild className="whitespace-nowrap">
              <Link href="/admin/leads/add">
                <Plus className="mr-2 h-4 w-4" />
                Add New Lead
              </Link>
            </AnimatedButton>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-4"
        >
          <motion.div variants={itemVariants}>
            <AnimatedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All leads in system
                </p>
              </CardContent>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newLeads}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualified</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.qualified}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for conversion
                </p>
              </CardContent>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.converted} converted
                </p>
              </CardContent>
            </AnimatedCard>
          </motion.div>
        </motion.div>        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedCard>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search leads by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="unqualified">Unqualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
                  <DialogTrigger asChild>
                    <AnimatedButton className="whitespace-nowrap">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lead
                    </AnimatedButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Lead</DialogTitle>
                      <DialogDescription>
                        Create a new lead manually. All fields marked with * are required.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter lead name"
                          value={newLeadData.name}
                          onChange={(e) => setNewLeadData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter lead email"
                          value={newLeadData.email}
                          onChange={(e) => setNewLeadData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          value={newLeadData.phoneNumber}
                          onChange={(e) => setNewLeadData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="message">Initial Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Enter any initial message or notes about this lead"
                          value={newLeadData.message}
                          onChange={(e) => setNewLeadData(prev => ({ ...prev, message: e.target.value }))}
                          rows={3}                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="source">Lead Source</Label>
                        <Select value={newLeadData.source} onValueChange={(value) => setNewLeadData(prev => ({ ...prev, source: value as LeadSource }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lead source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="google">Google</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="assignedTo">Assign To Employee</Label>
                        <Select value={newLeadData.assignedTo} onValueChange={(value) => setNewLeadData(prev => ({ ...prev, assignedTo: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee (optional)" />
                          </SelectTrigger>                          <SelectContent>
                            <SelectItem value="auto">Auto-assign (Round Robin)</SelectItem>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name} ({employee.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddLeadDialog(false)}
                      >
                        Cancel
                      </Button>
                      <AnimatedButton onClick={handleAddLead}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lead
                      </AnimatedButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        {/* Leads Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatedCard>
            <CardHeader>
              <CardTitle>Leads ({filteredLeads.length})</CardTitle>
              <CardDescription>
                Manage all leads and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "Start by capturing your first lead."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredLeads.map((lead, index) => (
                          <motion.tr
                            key={lead.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-muted/50 transition-colors"
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">{lead.name}</div>
                                {lead.message && (
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {lead.message}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="text-sm">{lead.email}</span>
                                </div>
                                {lead.phoneNumber && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <span className="text-sm">{lead.phoneNumber}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {lead.source}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${statusColors[lead.status || 'new']}`}>
                                {lead.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {lead.assignedTo ? (
                                <div className="flex items-center gap-2">
                                  <User2 className="h-3 w-3" />
                                  <span className="text-sm">{lead.assignedTo.name}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {format(parseISO(lead.createdAt), 'MMM dd, yyyy')}
                              </div>
                            </TableCell>                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* View Details Button */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedLead(lead)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Lead Details</DialogTitle>
                                      <DialogDescription>
                                        View detailed information about this lead
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedLead && (
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Name</Label>
                                          <p className="text-sm font-medium">{selectedLead.name}</p>
                                        </div>
                                        <div>
                                          <Label>Email</Label>
                                          <p className="text-sm">{selectedLead.email}</p>
                                        </div>
                                        {selectedLead.phoneNumber && (
                                          <div>
                                            <Label>Phone</Label>
                                            <p className="text-sm">{selectedLead.phoneNumber}</p>
                                          </div>
                                        )}
                                        <div>
                                          <Label>Source</Label>
                                          <p className="text-sm">{selectedLead.source}</p>
                                        </div>
                                        <div>
                                          <Label>Status</Label>
                                          <Badge className={`text-xs ${statusColors[selectedLead.status || 'new']}`}>
                                            {selectedLead.status}
                                          </Badge>
                                        </div>
                                        {selectedLead.message && (
                                          <div>
                                            <Label>Message</Label>
                                            <p className="text-sm">{selectedLead.message}</p>
                                          </div>
                                        )}
                                        {selectedLead.notes && (
                                          <div>
                                            <Label>Notes</Label>
                                            <p className="text-sm">{selectedLead.notes}</p>
                                          </div>
                                        )}
                                        <div>
                                          <Label>Created</Label>
                                          <p className="text-sm">{format(parseISO(selectedLead.createdAt), 'PPpp')}</p>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>                                </Dialog>

                                {/* Convert to Customer Button */}
                                {lead.status !== 'converted' && lead.status !== 'deleted' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setShowConvertDialog(true);
                                    }}
                                    title="Convert to Customer"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}

                                {/* Update Status Button */}
                                {lead.status !== 'deleted' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setUpdateData({ status: lead.status || 'new', notes: lead.notes || "" });
                                      setShowUpdateDialog(true);
                                    }}
                                    title="Update Status"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}

                                {/* Hold Button */}
                                {lead.status !== 'on_hold' && lead.status !== 'deleted' && lead.status !== 'converted' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleHoldLead(lead.id)}
                                    title="Put on Hold"
                                  >
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                )}

                                {/* Soft Delete Button */}
                                {lead.status !== 'deleted' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setShowDeleteDialog(true);
                                    }}
                                    title="Mark as Deleted"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}

                                {/* Hard Delete Button (Admin Only) */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setShowHardDeleteDialog(true);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                  title="Permanently Delete (Admin)"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* Convert to Customer Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead to Customer</DialogTitle>
            <DialogDescription>
              Convert this lead to a customer and assign to an employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignedEmployee">Assign to Employee (Optional)</Label>
              <Select
                value={convertData.assignedEmployeeId}
                onValueChange={(value) => setConvertData({ ...convertData, assignedEmployeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="auto">Auto-assign</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
              Cancel
            </Button>
            <AnimatedButton onClick={handleConvertToCustomer}>
              Convert to Customer
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
            <DialogDescription>
              Update the status and add notes for this lead
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={updateData.status}
                onValueChange={(value) => setUpdateData({ ...updateData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                placeholder="Add notes about this lead..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <AnimatedButton onClick={handleUpdateStatus}>
              Update Lead
            </AnimatedButton>
          </DialogFooter>        </DialogContent>
      </Dialog>

      {/* Soft Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Lead as Deleted</DialogTitle>
            <DialogDescription>
              This will mark the lead as deleted but keep it in the system for records. You can restore it later if needed.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="font-medium">{selectedLead.name}</p>
                <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
              </div>
              <p className="text-sm">Are you sure you want to mark this lead as deleted?</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedLead) {
                  handleDeleteLead(selectedLead.id);
                  setShowDeleteDialog(false);
                }
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Mark as Deleted
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hard Delete Confirmation Dialog */}
      <Dialog open={showHardDeleteDialog} onOpenChange={setShowHardDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Permanently Delete Lead</DialogTitle>
            <DialogDescription>
              <span className="text-destructive font-medium">⚠️ Warning: This action cannot be undone!</span>
              <br />
              This will permanently remove the lead from the system and all associated data will be lost.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                <p className="font-medium">{selectedLead.name}</p>
                <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
                <p className="text-xs text-destructive mt-2">This lead will be permanently deleted</p>
              </div>
              <div className="bg-destructive/10 p-3 rounded border border-destructive/20">
                <p className="text-sm font-medium text-destructive">Admin Only Action</p>
                <p className="text-xs text-muted-foreground">Only administrators can permanently delete leads</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHardDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleHardDeleteLead}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
