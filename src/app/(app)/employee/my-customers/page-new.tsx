"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerCard } from "@/components/employee/CustomerCard";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent } from "@/components/ui/animated-card";
import { AnimatedPage } from "@/components/ui/animated-page";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import type { CustomerStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, PlusCircle, Target, TrendingUp, Clock, Zap } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CustomerManualAddForm } from "@/components/shared/CustomerManualAddForm";
import { StatCard } from "@/components/shared/StatCard";
import { motion } from "framer-motion";

export default function MyCustomersPage() {
  const { currentUser } = useAuth();
  const { customers, dataLoading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const myCustomers = useMemo(() => {
    if (!currentUser) return [];
    return customers.filter(customer => customer.assignedTo === currentUser.id);
  }, [customers, currentUser]);

  const filteredCustomers = useMemo(() => {
    let filtered = myCustomers;

    if (statusFilter !== "all") {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(lowerSearchTerm) ||
        customer.email.toLowerCase().includes(lowerSearchTerm) ||
        (customer.phoneNumber && customer.phoneNumber.toLowerCase().includes(lowerSearchTerm)) ||
        (customer.category && customer.category.toLowerCase().includes(lowerSearchTerm))
      );
    }

    return filtered;
  }, [myCustomers, statusFilter, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = myCustomers.length;
    const hot = myCustomers.filter(c => c.status === 'hot').length;
    const neutral = myCustomers.filter(c => c.status === 'neutral').length;
    const cold = myCustomers.filter(c => c.status === 'cold').length;
    const recentlyContacted = myCustomers.filter(c => {
      if (!c.lastContacted) return false;
      const lastContactDate = new Date(c.lastContacted);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return lastContactDate >= sevenDaysAgo;
    }).length;

    return { total, hot, neutral, cold, recentlyContacted };
  }, [myCustomers]);

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading your customers..." /></div>;
  }

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
            title={`Welcome back, ${currentUser?.name || 'Employee'}!`}
            description="Manage your assigned customers and track your performance metrics."
          />
          
          <motion.div 
            className="flex flex-wrap gap-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <AnimatedButton 
                  variant="default" 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg glassmorphism"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add New Customer
                </AnimatedButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-0 glassmorphism">
                {isAddModalOpen && <CustomerManualAddForm onFormSubmit={() => setIsAddModalOpen(false)} />}
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <StatCard 
          title="Total Customers" 
          value={stats.total} 
          icon={Users} 
          className="glassmorphism border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
        />
        <StatCard 
          title="Hot Leads" 
          value={stats.hot} 
          icon={Zap} 
          className="glassmorphism border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
        />
        <StatCard 
          title="Neutral" 
          value={stats.neutral} 
          icon={Target} 
          className="glassmorphism border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
        />
        <StatCard 
          title="Cold Leads" 
          value={stats.cold} 
          icon={TrendingUp} 
          className="glassmorphism border-red-500/20 bg-gradient-to-br from-red-500/10 to-pink-500/10"
        />
        <StatCard 
          title="Recently Contacted" 
          value={stats.recentlyContacted} 
          icon={Clock} 
          className="glassmorphism border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
        />
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full lg:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers by name, email, phone, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full glassmorphism border-border/50 focus:border-primary/50"
                />
              </div>
              
              <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as CustomerStatus | "all")} className="w-full lg:w-auto">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto glassmorphism">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
                  <TabsTrigger value="hot" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Hot</TabsTrigger>
                  <TabsTrigger value="neutral" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">Neutral</TabsTrigger>
                  <TabsTrigger value="cold" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Cold</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Customer Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {filteredCustomers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              >
                <CustomerCard customer={customer} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="text-center py-16 glassmorphism rounded-2xl border-dashed border-2 border-border/50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">
              {searchTerm || statusFilter !== "all" ? "No customers found" : "No customers assigned yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria." 
                : "Start by adding your first customer or ask your admin to assign customers to you."
              }
            </p>
            {(!searchTerm && statusFilter === "all") && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <AnimatedButton 
                    variant="default"
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Your First Customer
                  </AnimatedButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] p-0 glassmorphism">
                  {isAddModalOpen && <CustomerManualAddForm onFormSubmit={() => setIsAddModalOpen(false)} />}
                </DialogContent>
              </Dialog>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Results Summary */}
      {(searchTerm || statusFilter !== "all") && filteredCustomers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center text-muted-foreground"
        >
          Showing {filteredCustomers.length} of {myCustomers.length} customers
          {statusFilter !== "all" && ` (${statusFilter} status)`}
          {searchTerm && ` matching "${searchTerm}"`}
        </motion.div>
      )}

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl" />
      </div>
    </AnimatedPage>
  );
}
