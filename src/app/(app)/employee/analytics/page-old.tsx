
"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, TrendingUp, TrendingDown, ListChecks, UserCheck, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Image from "next/image";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function EmployeeAnalyticsPage() {
  const { currentUser } = useAuth();
  const { customers, dataLoading } = useData();

  const myCustomers = useMemo(() => {
    if (!currentUser) return [];
    return customers.filter(c => c.assignedTo === currentUser.id);
  }, [customers, currentUser]);

  const customerStats = useMemo(() => {
    const hot = myCustomers.filter(c => c.status === 'hot').length;
    const cold = myCustomers.filter(c => c.status === 'cold').length;
    const neutral = myCustomers.filter(c => c.status === 'neutral').length;
    return { hot, cold, neutral, total: myCustomers.length };
  }, [myCustomers]);
  
  const chartData = [
    { name: 'Hot', count: customerStats.hot, fill: 'hsl(var(--chart-2))' }, 
    { name: 'Neutral', count: customerStats.neutral, fill: 'hsl(var(--chart-4))' }, 
    { name: 'Cold', count: customerStats.cold, fill: 'hsl(var(--chart-1))' }, 
  ];

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading your analytics..." /></div>;
  }

  if (!currentUser) {
    return <div className="text-center py-10">Please log in.</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Performance Analytics"
        description="Track your customer engagement and progress."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Assigned Customers" value={customerStats.total} icon={UserCheck} />
        <StatCard title="Hot Leads" value={customerStats.hot} icon={TrendingUp} className="bg-green-500/10 dark:bg-green-500/20 border-green-500/50" />
        <StatCard title="Cold Leads" value={customerStats.cold} icon={TrendingDown} className="bg-red-500/10 dark:bg-red-500/20 border-red-500/50" />
        <StatCard title="Neutral Leads" value={customerStats.neutral} icon={ListChecks} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-primary" /> Customer Status Distribution
            </CardTitle>
            <CardDescription>Overview of your customers by their current status.</CardDescription>
          </CardHeader>
          <CardContent>
            {myCustomers.length > 0 ? (
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
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
                <p className="text-center text-muted-foreground py-10">No customer data available to display chart.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <CardHeader>
                <CardTitle className="font-headline flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-primary" /> Activity Insights
                </CardTitle>
                <CardDescription>Tips and focus areas based on your current data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                    <Image 
                        src="https://placehold.co/600x338/3730a3/e0e7ff" 
                        alt="Data Analytics Illustration" 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="data charts graph"
                    />
                </div>
                {customerStats.hot > customerStats.cold && customerStats.hot > customerStats.neutral && (
                    <p className="text-sm text-foreground">
                        Great job on converting leads! Keep engaging with your <span className="font-semibold text-green-600 dark:text-green-400">Hot Leads</span> to close deals.
                    </p>
                )}
                {customerStats.neutral > customerStats.hot && (
                     <p className="text-sm text-foreground">
                        Focus on your <span className="font-semibold text-yellow-600 dark:text-yellow-400">Neutral Leads</span>. Identify their needs and provide solutions to move them to 'Hot'.
                    </p>
                )}
                 {customerStats.cold > 0 && (
                     <p className="text-sm text-foreground">
                        Review your <span className="font-semibold text-red-600 dark:text-red-400">Cold Leads</span>. Understand reasons for disinterest to improve future interactions.
                    </p>
                )}
                {customerStats.total === 0 && (
                     <p className="text-sm text-muted-foreground">
                        You currently have no customers assigned. Once you start managing customers, your analytics will appear here.
                    </p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
