"use client";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [instanceId, setInstanceId] = useState("");
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInstanceId(localStorage.getItem("ultramsg_instance_id") || "");
    setToken(localStorage.getItem("ultramsg_token") || "");
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ultramsg_instance_id", instanceId);
    localStorage.setItem("ultramsg_token", token);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isConnected = !!instanceId && !!token;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Integration Settings</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">UltraMsg Instance ID</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={instanceId}
            onChange={e => setInstanceId(e.target.value)}
            placeholder="e.g. instance126912"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">UltraMsg Token</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="e.g. m749s4yi6d6i8vwa"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        {saved && <div className="text-green-600 mt-2">Settings saved!</div>}
      </form>
      <div className="mt-6">
        <span className="font-semibold">Status:</span>{" "}
        {isConnected ? (
          <span className="text-green-600">Connected</span>
        ) : (
          <span className="text-yellow-600">Not Connected</span>
        )}
      </div>
    </div>
  );
} 