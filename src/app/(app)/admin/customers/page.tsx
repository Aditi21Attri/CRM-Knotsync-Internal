
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerTableAdmin } from "@/components/admin/CustomerTableAdmin";

export default function AllCustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="All Customers"
        description="View, manage, and assign all customers in the system."
      />
      <CustomerTableAdmin />
    </div>
  );
}
