
"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerCard } from "@/components/employee/CustomerCard";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import type { CustomerStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, ListFilter, UserCheck, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function MyCustomersPage() {
  const { currentUser } = useAuth();
  const { customers, dataLoading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<CustomerStatus | "all">("all");

  const myCustomers = useMemo(() => {
    if (!currentUser) return [];
    return customers.filter(c => c.assignedTo === currentUser.id);
  }, [customers, currentUser]);

  const filteredCustomers = useMemo(() => {
    let filtered = myCustomers;
    if (activeTab !== "all") {
      filtered = filtered.filter(c => c.status === activeTab);
    }
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return filtered;
  }, [myCustomers, activeTab, searchTerm]);

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading your customers..." /></div>;
  }

  if (!currentUser) {
    return <div className="text-center py-10">Please log in.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assigned Customers"
        description="View and manage customers assigned to you."
      />

      <div className="sticky top-[calc(theme(spacing.16)_-_1px)]  md:top-[calc(theme(spacing.16)_-_1px)] z-40 bg-background/80 backdrop-blur-md py-4 -mt-2 -mx-4 md:-mx-6 px-4 md:px-6 rounded-b-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search your customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CustomerStatus | "all")} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10">
              <TabsTrigger value="all" className="text-xs sm:text-sm py-2">All</TabsTrigger>
              <TabsTrigger value="hot" className="text-xs sm:text-sm py-2">Hot</TabsTrigger>
              <TabsTrigger value="neutral" className="text-xs sm:text-sm py-2">Neutral</TabsTrigger>
              <TabsTrigger value="cold" className="text-xs sm:text-sm py-2">Cold</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>


      {filteredCustomers.length === 0 ? (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-2xl font-semibold">No Customers Found</h3>
          <p className="mt-2 text-md text-muted-foreground">
            {searchTerm || activeTab !== "all" 
              ? "No customers match your current filters." 
              : "You currently have no customers assigned."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}
