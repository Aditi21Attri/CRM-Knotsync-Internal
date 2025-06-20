"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addLeadAction, getLeads } from "@/lib/actions/leadActions";
import { getAllEmployees } from "@/lib/actions/userActions";
import type { Lead } from "@/lib/types";
import { Phone, Mail, MessageCircle, MessageSquare } from "lucide-react";

export default function LeadCapturePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedHandler, setSelectedHandler] = useState<string>("auto");

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
  };

  // Integration instructions for admin
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/meta-leads` : '/api/webhooks/meta-leads';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Capture"
        description="Unified intake for website and social media leads."
      />

      {/* Admin Integration Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Integrate Your Lead Sources</h2>
        <div className="mb-4">
          <h3 className="font-semibold">Meta (Facebook/Instagram) Lead Ads Webhook</h3>
          <ol className="list-decimal ml-6 text-sm mb-2">
            <li>Go to your <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Meta for Developers App Dashboard</a>.</li>
            <li>Navigate to <b>Webhooks</b> and add a new subscription for <b>Leadgen</b>.</li>
            <li>Set the callback URL to: <span className="font-mono bg-gray-100 px-2 py-1 rounded">http://localhost:9002/api/webhooks/meta-leads</span></li>
            <li>Complete the verification process and publish your changes.</li>
            <li>Once set up, leads from your ads will appear here in real time.</li>
          </ol>
          <div className="text-xs text-gray-600">Status: <span className="text-yellow-600">Not Connected</span></div>
        </div>
        <div>
          <h3 className="font-semibold">WhatsApp Notification Integration</h3>
          <ol className="list-decimal ml-6 text-sm mb-2">
            <li>Sign up for a <a href="https://www.twilio.com/whatsapp" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Twilio WhatsApp API</a> account.</li>
            <li>Follow Twilio's guide to set up your WhatsApp sender and get API credentials.</li>
            <li>Enter your Twilio credentials in the <b>Settings</b> page (coming soon).</li>
            <li>Once connected, you'll receive WhatsApp notifications for every new lead.</li>
          </ol>
          <div className="text-xs text-gray-600">Status: <span className="text-yellow-600">Not Connected</span> {/* TODO: Show real status */}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <Input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} />
        <textarea
          name="message"
          placeholder="Message"
          value={form.message}
          onChange={handleChange}
          className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
        <div>
          <label className="block font-semibold mb-1">Assign Handler</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedHandler}
            onChange={e => setSelectedHandler(e.target.value)}
          >
            <option value="auto">Auto-Assign (Round Robin)</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Lead"}</Button>
      </form>
      <div>
        <h2 className="text-xl font-semibold mb-2">All Leads</h2>
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">Source</th>
              <th className="border px-2 py-1">Created</th>
              <th className="border px-2 py-1">Handler</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td className="border px-2 py-1">{lead.name}</td>
                <td className="border px-2 py-1">{lead.email}</td>
                <td className="border px-2 py-1">{lead.phoneNumber}</td>
                <td className="border px-2 py-1">{lead.source}</td>
                <td className="border px-2 py-1">{new Date(lead.createdAt).toLocaleString()}</td>
                <td className="border px-2 py-1">{lead.assignedTo?.name || "-"}</td>
                <td className="border px-2 py-1 flex gap-2">
                  {lead.phoneNumber && (
                    <a href={`tel:${lead.phoneNumber}`} title="Call"><Phone className="w-4 h-4 text-blue-600" /></a>
                  )}
                  {lead.phoneNumber && (
                    <a href={`sms:${lead.phoneNumber}`} title="SMS"><MessageCircle className="w-4 h-4 text-green-600" /></a>
                  )}
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} title="Email"><Mail className="w-4 h-4 text-purple-600" /></a>
                  )}
                  {lead.phoneNumber && (
                    <a href={`https://wa.me/${lead.phoneNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"><MessageSquare className="w-4 h-4 text-green-700" /></a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 