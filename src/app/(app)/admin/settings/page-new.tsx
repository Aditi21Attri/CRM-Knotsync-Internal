"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent } from "@/components/ui/animated-card";
import { AnimatedPage } from "@/components/ui/animated-page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, MessageSquare, Zap, Check, AlertCircle, Smartphone, Shield, Database } from "lucide-react";
import { motion } from "framer-motion";

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
    setTimeout(() => setSaved(false), 3000);
  };

  const isConnected = !!instanceId && !!token;

  return (
    <AnimatedPage className="space-y-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
          <PageHeader
            title="System Settings"
            description="Configure integrations, preferences, and system-wide settings for your CRM."
          />
        </div>
      </motion.div>

      {/* Integration Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardContent className="pt-6 text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
              isConnected ? 'bg-green-500/20' : 'bg-gray-500/20'
            }`}>
              <MessageSquare className={`h-6 w-6 ${isConnected ? 'text-green-500' : 'text-gray-500'}`} />
            </div>
            <h3 className="font-semibold text-lg mb-2">WhatsApp Integration</h3>
            <Badge variant={isConnected ? 'default' : 'secondary'} className={
              isConnected 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-gray-500 text-white'
            }>
              {isConnected ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Not Connected
                </>
              )}
            </Badge>
          </AnimatedCardContent>
        </AnimatedCard>

        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
              <Database className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Database</h3>
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Check className="mr-1 h-3 w-3" />
              Active
            </Badge>
          </AnimatedCardContent>
        </AnimatedCard>

        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
              <Shield className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Security</h3>
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <Check className="mr-1 h-3 w-3" />
              Secured
            </Badge>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* WhatsApp Integration Settings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center">
              <Smartphone className="mr-2 h-5 w-5 text-primary" />
              WhatsApp Integration (UltraMsg)
            </h3>
            <p className="text-muted-foreground">
              Configure WhatsApp messaging integration for customer communication
            </p>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="instanceId" className="text-sm font-semibold">
                  UltraMsg Instance ID
                </Label>
                <Input
                  id="instanceId"
                  value={instanceId}
                  onChange={e => setInstanceId(e.target.value)}
                  placeholder="e.g. instance126912"
                  className="glassmorphism border-border/50 focus:border-primary/50"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your UltraMsg instance identifier from your dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-semibold">
                  UltraMsg Token
                </Label>
                <Input
                  id="token"
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="e.g. m749s4yi6d6i8vwa"
                  className="glassmorphism border-border/50 focus:border-primary/50"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your UltraMsg API token (keep this secure)
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <AnimatedButton 
                  type="submit" 
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Save Settings
                </AnimatedButton>

                {saved && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center text-green-600 dark:text-green-400"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Settings saved successfully!
                  </motion.div>
                )}
              </div>
            </form>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Integration Status
            </h3>
            <p className="text-muted-foreground">
              Current status of all system integrations and services
            </p>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg glassmorphism border border-border/30">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <div>
                    <p className="font-semibold">WhatsApp Messaging</p>
                    <p className="text-sm text-muted-foreground">
                      {isConnected ? 'Ready to send messages' : 'Configure credentials to enable'}
                    </p>
                  </div>
                </div>
                <Badge variant={isConnected ? 'default' : 'secondary'} className={
                  isConnected 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : 'bg-gray-500 text-white'
                }>
                  {isConnected ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg glassmorphism border border-border/30">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <div>
                    <p className="font-semibold">Database Connection</p>
                    <p className="text-sm text-muted-foreground">
                      MongoDB Atlas connection is active
                    </p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg glassmorphism border border-border/30">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                  <div>
                    <p className="font-semibold">Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      User authentication and authorization system
                    </p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  Active
                </Badge>
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Features Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Available Features
            </h3>
            <p className="text-muted-foreground">
              Current system capabilities and upcoming features
            </p>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Customer Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete customer relationship management with status tracking
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Employee Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Team member administration with role-based access control
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Data Import</h4>
                  <p className="text-sm text-muted-foreground">
                    CSV import with intelligent mapping and auto-assignment
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Performance Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed performance tracking and AI-powered insights
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">WhatsApp Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Direct customer communication via WhatsApp messaging
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI Performance Summaries</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate AI-powered employee performance reports
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl" />
      </div>
    </AnimatedPage>
  );
}
