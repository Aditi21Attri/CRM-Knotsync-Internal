
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { PerformanceSummaryTool } from "@/components/admin/PerformanceSummaryTool";
import { StatCard } from "@/components/shared/StatCard";
import { useData } from "@/contexts/DataContext";
import { BarChartBig, Users, CheckCircle, XCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function PerformancePage() {
  const { customers, employees, dataLoading } = useData();

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading performance data..." /></div>;
  }

  // Basic aggregate stats for demonstration
  const totalCustomers = customers.length;
  const hotCustomersCount = customers.filter(c => c.status === 'hot').length;
  const coldCustomersCount = customers.filter(c => c.status === 'cold').length;
  const activeEmployeesCount = employees.length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Employee Performance Center"
        description="Analyze employee performance and generate AI-driven summaries."
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Employees" value={activeEmployeesCount} icon={Users} />
        <StatCard title="Total Customers Managed" value={totalCustomers} icon={BarChartBig} />
        <StatCard title="Successful Outcomes (Hot)" value={hotCustomersCount} icon={CheckCircle} className="bg-green-500/10 dark:bg-green-500/20 border-green-500/50" />
        <StatCard title="Unsuccessful Outcomes (Cold)" value={coldCustomersCount} icon={XCircle} className="bg-red-500/10 dark:bg-red-500/20 border-red-500/50" />
      </div>

      <PerformanceSummaryTool />

      {/* Placeholder for more detailed performance charts or tables */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
          <CardDescription>Further analytics will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Charts and tables showing individual employee performance, customer conversion rates, etc.</p>
        </CardContent>
      </Card> */}
    </div>
  );
}
