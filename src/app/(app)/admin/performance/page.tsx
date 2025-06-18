
"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PerformanceSummaryTool } from "@/components/admin/PerformanceSummaryTool";
import { StatCard } from "@/components/shared/StatCard";
import { useData } from "@/contexts/DataContext";
import type { User, Customer, CustomerStatus } from "@/lib/types";
import { BarChartBig, Users, CheckCircle, XCircle, PieChart, TrendingUp, Award, UserCheck, LineChart } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

interface EmployeePerformanceStats {
  employee: User;
  totalAssigned: number;
  hot: number;
  neutral: number;
  cold: number;
}

export default function PerformancePage() {
  const { customers, employees, dataLoading } = useData();

  const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const employeePerformanceData = useMemo((): EmployeePerformanceStats[] => {
    if (!employees || !customers) return [];
    return employees.map(emp => {
      const assignedCustomers = customers.filter(c => c.assignedTo === emp.id);
      return {
        employee: emp,
        totalAssigned: assignedCustomers.length,
        hot: assignedCustomers.filter(c => c.status === 'hot').length,
        neutral: assignedCustomers.filter(c => c.status === 'neutral').length,
        cold: assignedCustomers.filter(c => c.status === 'cold').length,
      };
    });
  }, [employees, customers]);

  const topPerformingEmployees = useMemo(() => {
    return [...employeePerformanceData]
      .sort((a, b) => b.hot - a.hot || b.totalAssigned - a.totalAssigned) // Sort by hot, then by total assigned
      .slice(0, 3); // Show top 3
  }, [employeePerformanceData]);

  const overallStatusCounts = useMemo(() => {
    const hot = customers.filter(c => c.status === 'hot').length;
    const cold = customers.filter(c => c.status === 'cold').length;
    const neutral = customers.filter(c => c.status === 'neutral').length;
    return { hot, cold, neutral, total: customers.length };
  }, [customers]);

  const overallStatusChartData = [
    { name: 'Hot', count: overallStatusCounts.hot, fill: 'hsl(var(--chart-2))' },
    { name: 'Neutral', count: overallStatusCounts.neutral, fill: 'hsl(var(--chart-4))' },
    { name: 'Cold', count: overallStatusCounts.cold, fill: 'hsl(var(--chart-1))' },
  ];

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading performance data..." /></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Performance & Analytics Center"
        description="Analyze system-wide customer data and employee performance."
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Employees" value={employees.length} icon={Users} />
        <StatCard title="Total Customers" value={overallStatusCounts.total} icon={BarChartBig} />
        <StatCard title="Hot Leads (System-Wide)" value={overallStatusCounts.hot} icon={CheckCircle} className="bg-green-500/10 dark:bg-green-500/20 border-green-500/50" />
        <StatCard title="Cold Leads (System-Wide)" value={overallStatusCounts.cold} icon={XCircle} className="bg-red-500/10 dark:bg-red-500/20 border-red-500/50" />
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-headline font-semibold flex items-center"><Award className="mr-3 h-7 w-7 text-primary" /> Top Performing Employees (by Hot Leads)</h2>
        {topPerformingEmployees.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topPerformingEmployees.map(data => (
              <Card key={data.employee.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                   <Avatar className="h-12 w-12 border-2 border-primary/50">
                      <AvatarImage src={data.employee.avatarUrl || `https://placehold.co/80x80/E5EAF7/2962FF?text=${getInitials(data.employee.name)}`} alt={data.employee.name} data-ai-hint="employee avatar" />
                      <AvatarFallback>{getInitials(data.employee.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="font-headline text-lg">{data.employee.name}</CardTitle>
                      <CardDescription>{data.employee.email}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Hot Leads:</span>
                    <Badge variant="default" className="bg-green-500/80 hover:bg-green-500/70 text-white text-base">{data.hot}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Assigned:</span>
                    <Badge variant="secondary" className="text-base">{data.totalAssigned}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No employee performance data to display yet.</p>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-headline font-semibold flex items-center"><UserCheck className="mr-3 h-7 w-7 text-primary" /> Customer Status per Employee</h2>
        <Card className="shadow-lg">
          <CardContent className="p-0">
            {employeePerformanceData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-center">Total Assigned</TableHead>
                      <TableHead className="text-center">Hot Leads</TableHead>
                      <TableHead className="text-center">Neutral Leads</TableHead>
                      <TableHead className="text-center">Cold Leads</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePerformanceData.map(data => (
                      <TableRow key={data.employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={data.employee.avatarUrl || `https://placehold.co/40x40/E5EAF7/2962FF?text=${getInitials(data.employee.name)}`} alt={data.employee.name} data-ai-hint="employee avatar" />
                              <AvatarFallback>{getInitials(data.employee.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{data.employee.name}</p>
                              <p className="text-xs text-muted-foreground">{data.employee.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{data.totalAssigned}</TableCell>
                        <TableCell className="text-center"><Badge variant="default" className="bg-green-500/80 hover:bg-green-500/70 text-white">{data.hot}</Badge></TableCell>
                        <TableCell className="text-center"><Badge variant="default" className="bg-yellow-500/80 hover:bg-yellow-500/70 text-white">{data.neutral}</Badge></TableCell>
                        <TableCell className="text-center"><Badge variant="destructive">{data.cold}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center p-10">No employees found or no customers assigned to display individual statistics.</p>
            )}
          </CardContent>
        </Card>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-2xl font-headline font-semibold flex items-center"><PieChart className="mr-3 h-7 w-7 text-primary" /> Overall Customer Status Distribution</h2>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>System-Wide Customer Status</CardTitle>
            <CardDescription>Current breakdown of all customers by status.</CardDescription>
          </CardHeader>
          <CardContent>
            {overallStatusCounts.total > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={overallStatusChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false}/>
                  <Tooltip
                      contentStyle={{
                          background: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "var(--radius)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-10">No customer data available to display chart.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <PerformanceSummaryTool />
    </div>
  );
}

