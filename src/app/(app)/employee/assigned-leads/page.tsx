"use client";
import { useEffect, useState } from "react";
import { getLeadsAssignedTo, updateLeadDetails } from "@/lib/actions/leadActions";
import { useAuth } from "@/contexts/AuthContext";
import type { Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle, MessageSquare } from "lucide-react";

const STATUS_OPTIONS = ["Hot", "Cold", "Neutral"];

export default function AssignedLeadsPage() {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [editing, setEditing] = useState<{ [leadId: string]: boolean }>({});
  const [form, setForm] = useState<{ [leadId: string]: { status?: string; notes?: string; expectedRevenue?: string } }>({});

  useEffect(() => {
    if (currentUser) {
      getLeadsAssignedTo(currentUser.id).then(setLeads);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">My Assigned Leads</h1>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Notes</th>
            <th className="border px-2 py-1">Revenue</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id}>
              <td className="border px-2 py-1">{lead.name}</td>
              <td className="border px-2 py-1">{lead.email}</td>
              <td className="border px-2 py-1">{lead.phoneNumber}</td>
              <td className="border px-2 py-1">
                {editing[lead.id] ? (
                  <select
                    value={form[lead.id]?.status || ""}
                    onChange={e => handleChange(lead.id, "status", e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Select</option>
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  lead.status || "-"
                )}
              </td>
              <td className="border px-2 py-1">
                {editing[lead.id] ? (
                  <input
                    value={form[lead.id]?.notes || ""}
                    onChange={e => handleChange(lead.id, "notes", e.target.value)}
                    className="border rounded px-2 py-1 w-32"
                  />
                ) : (
                  lead.notes || "-"
                )}
              </td>
              <td className="border px-2 py-1">
                {editing[lead.id] ? (
                  <input
                    value={form[lead.id]?.expectedRevenue || ""}
                    onChange={e => handleChange(lead.id, "expectedRevenue", e.target.value)}
                    className="border rounded px-2 py-1 w-20"
                  />
                ) : (
                  lead.expectedRevenue || "-"
                )}
              </td>
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
                {editing[lead.id] ? (
                  <Button size="sm" onClick={() => handleSave(lead.id)}>Save</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleEdit(lead)}>Edit</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 