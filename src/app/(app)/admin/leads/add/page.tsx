"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addLeadAction } from "@/lib/actions/leadActions";
import { getAllEmployees } from "@/lib/actions/userActions";
import type { LeadSource } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, User, Mail, Phone, MessageSquare, Target, Users } from "lucide-react";
import { useEffect } from "react";

export default function AddLeadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; name: string; email: string }[]>([]);  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    message: "",
    source: "other" as LeadSource,
    assignedTo: "auto"
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const employeesData = await getAllEmployees();
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leadData.name || !leadData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {      const assignedTo = leadData.assignedTo && leadData.assignedTo !== "auto"
        ? employees.find(emp => emp.id === leadData.assignedTo) || null
        : null;

      await addLeadAction({
        name: leadData.name,
        email: leadData.email,
        phoneNumber: leadData.phoneNumber || undefined,
        message: leadData.message || undefined,
        source: leadData.source,
        assignedTo
      });

      toast({
        title: "Success",
        description: "Lead added successfully!",
      });

      // Redirect to leads page
      router.push('/admin/leads');
    } catch (error) {
      console.error('Failed to add lead:', error);
      toast({
        title: "Error",
        description: "Failed to add lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {    setLeadData({
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
      source: "other",
      assignedTo: "auto"
    });
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <PageHeader
            title="Add New Lead"
            description="Create a new lead manually and assign it to a team member"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatedCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Lead Information
              </CardTitle>
              <CardDescription>
                Fill in the details below to create a new lead. Fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter lead's full name"
                      value={leadData.name}
                      onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={leadData.email}
                      onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={leadData.phoneNumber}
                    onChange={(e) => setLeadData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>

                {/* Lead Source */}
                <div className="space-y-2">
                  <Label htmlFor="source" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Lead Source
                  </Label>
                  <Select value={leadData.source} onValueChange={(value) => setLeadData(prev => ({ ...prev, source: value as LeadSource }))}>
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

                {/* Assignment */}
                <div className="space-y-2">
                  <Label htmlFor="assignedTo" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assign To Employee
                  </Label>
                  <Select value={leadData.assignedTo} onValueChange={(value) => setLeadData(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee (optional)" />
                    </SelectTrigger>                    <SelectContent>
                      <SelectItem value="auto">Auto-assign (Round Robin)</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Initial Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Initial Message / Notes
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Enter any initial message or notes about this lead..."
                    value={leadData.message}
                    onChange={(e) => setLeadData(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <AnimatedButton
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {loading ? "Adding Lead..." : "Add Lead"}
                  </AnimatedButton>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                    className="flex-1"
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Quick Tips</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• If no employee is selected, the lead will be auto-assigned using round-robin distribution</li>
                <li>• Use the initial message field to record any context about how you discovered this lead</li>
                <li>• Accurate lead source tracking helps improve your marketing efforts</li>
                <li>• Make sure to verify email addresses to avoid bounce-backs</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
