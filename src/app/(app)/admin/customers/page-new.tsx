"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerTableAdmin } from "@/components/admin/CustomerTableAdmin";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent } from "@/components/ui/animated-card";
import { AnimatedPage } from "@/components/ui/animated-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import { Trash2, AlertTriangle, PlusCircle, Users, Database, TrendingUp } from "lucide-react";
import { CustomerManualAddForm } from "@/components/shared/CustomerManualAddForm";
import { StatCard } from "@/components/shared/StatCard";
import { motion } from "framer-motion";

export default function AllCustomersPage() {
  const { customers, deleteAllCustomers } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAllCustomers = async () => {
    await deleteAllCustomers();
    setIsDeleteDialogOpen(false);
  };

  // Calculate stats
  const totalCustomers = customers.length;
  const hotCustomers = customers.filter(c => c.status === 'hot').length;
  const neutralCustomers = customers.filter(c => c.status === 'neutral').length;
  const coldCustomers = customers.filter(c => c.status === 'cold').length;
  const assignedCustomers = customers.filter(c => c.assignedTo).length;

  return (
    <AnimatedPage className="space-y-8">
      {/* Modern Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
          <PageHeader
            title="Customer Management Hub"
            description="Manage all customer relationships and data in one centralized location."
          />
          
          {/* Action Buttons */}
          <motion.div 
            className="flex flex-wrap gap-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>                <AnimatedButton variant="default" size="lg" className="glassmorphism bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add New Customer
                </AnimatedButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-0">
                {isAddModalOpen && <CustomerManualAddForm onFormSubmit={() => setIsAddModalOpen(false)} />}
              </DialogContent>
            </Dialog>

            {customers.length > 0 && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <AnimatedButton variant="destructive" size="lg" className="bg-gradient-to-r from-destructive to-destructive/80">
                    <Trash2 className="mr-2 h-5 w-5" /> 
                    Delete All Customers
                  </AnimatedButton>
                </AlertDialogTrigger>
                <AlertDialogContent className="glassmorphism">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center text-destructive">
                      <AlertTriangle className="mr-2 h-6 w-6" />
                      Confirm Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you absolutely sure you want to delete ALL customers? This action will permanently remove all customer data from the system and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllCustomers}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Delete All Customers
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >        <StatCard 
          title="Total Customers" 
          value={totalCustomers} 
          icon={Users} 
          className="glassmorphism border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
        />
        <StatCard 
          title="Hot Leads" 
          value={hotCustomers} 
          icon={TrendingUp} 
          className="glassmorphism border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
        />
        <StatCard 
          title="Neutral" 
          value={neutralCustomers} 
          icon={Database} 
          className="glassmorphism border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
        />
        <StatCard 
          title="Cold Leads" 
          value={coldCustomers} 
          icon={Database} 
          className="glassmorphism border-red-500/20 bg-gradient-to-br from-red-500/10 to-pink-500/10"
        />
        <StatCard 
          title="Assigned" 
          value={assignedCustomers} 
          icon={Users} 
          className="glassmorphism border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
        />
      </motion.div>

      {/* Customer Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Customer Database
            </h3>
            <p className="text-muted-foreground">
              Complete overview of all customer relationships and interactions
            </p>
          </AnimatedCardHeader>
          <AnimatedCardContent className="p-0">
            <CustomerTableAdmin />
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
