
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerTableAdmin } from "@/components/admin/CustomerTableAdmin";
import { Button } from "@/components/ui/button";
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
import { Trash2, AlertTriangle, PlusCircle } from "lucide-react";
import { CustomerManualAddForm } from "@/components/shared/CustomerManualAddForm";

export default function AllCustomersPage() {
  const { deleteAllCustomers, customers } = useData();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDeleteAll = async () => {
    await deleteAllCustomers();
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Customers"
        description="View, manage, and assign all customers in the system."
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] p-0">
                {isAddModalOpen && <CustomerManualAddForm onFormSubmit={() => setIsAddModalOpen(false)} />}
              </DialogContent>
            </Dialog>

            {customers.length > 0 && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete All Customers
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
                      Confirm Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you absolutely sure you want to delete ALL customers? This action will permanently remove all customer data from the system and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAll}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Yes, Delete All Customers
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        }
      />
      <CustomerTableAdmin />
    </div>
  );
}
