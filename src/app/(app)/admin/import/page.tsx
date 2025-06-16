
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { ExcelImportForm } from "@/components/admin/ExcelImportForm";

export default function ImportDataPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Customer Data"
        description="Upload CSV files to add new customers to the CRM."
      />
      <ExcelImportForm />
    </div>
  );
}
