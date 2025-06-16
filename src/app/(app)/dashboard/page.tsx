
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, UserCheck, PieChart, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { customers, users, employees, dataLoading } = useData();

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading dashboard data..." /></div>;
  }

  if (!currentUser) {
    return <div className="text-center py-10">Please log in to view the dashboard.</div>;
  }

  const totalCustomers = customers.length;
  const assignedCustomers = customers.filter(c => c.assignedTo === currentUser.id).length;
  const hotCustomers = customers.filter(c => c.status === 'hot' && (currentUser.role === 'admin' || c.assignedTo === currentUser.id)).length;
  const coldCustomers = customers.filter(c => c.status === 'cold' && (currentUser.role === 'admin' || c.assignedTo === currentUser.id)).length;
  const neutralCustomers = customers.filter(c => c.status === 'neutral' && (currentUser.role === 'admin' || c.assignedTo === currentUser.id)).length;

  return (
    <div className="space-y-8">
      <PageHeader 
        title={`Welcome, ${currentUser.name}!`}
        description={currentUser.role === 'admin' ? "Oversee your CRM operations and team performance." : "Manage your customers and track your progress."} 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currentUser.role === 'admin' && (
          <>
            <StatCard title="Total Customers" value={totalCustomers} icon={Briefcase} description="All customers in the system" />
            <StatCard title="Total Employees" value={employees.length} icon={Users} description="Active employees in your team" />
          </>
        )}
        {currentUser.role === 'employee' && (
          <StatCard title="My Assigned Customers" value={assignedCustomers} icon={UserCheck} description="Customers you are managing" />
        )}
        <StatCard title="Hot Leads" value={hotCustomers} icon={TrendingUp} description={currentUser.role === 'admin' ? "High-potential leads system-wide" : "Your high-potential leads"} className="bg-green-500/10 dark:bg-green-500/20 border-green-500/50"/>
        <StatCard title="Cold Leads" value={coldCustomers} icon={TrendingDown} description={currentUser.role === 'admin' ? "Leads that opted out system-wide" : "Your leads that opted out"} className="bg-red-500/10 dark:bg-red-500/20 border-red-500/50" />
        <StatCard title="Neutral Leads" value={neutralCustomers} icon={PieChart} description={currentUser.role === 'admin' ? "Leads on hold system-wide" : "Your leads on hold"} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
            <CardDescription>Jump directly to key sections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentUser.role === 'admin' && (
              <>
                <Link href="/admin/import" passHref><Button variant="outline" className="w-full justify-start"><FileInput className="mr-2 h-4 w-4" /> Import New Data</Button></Link>
                <Link href="/admin/employees" passHref><Button variant="outline" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> Manage Employees</Button></Link>
                <Link href="/admin/customers" passHref><Button variant="outline" className="w-full justify-start"><Briefcase className="mr-2 h-4 w-4" /> View All Customers</Button></Link>
              </>
            )}
            {currentUser.role === 'employee' && (
              <Link href="/employee/my-customers" passHref><Button variant="outline" className="w-full justify-start"><UserCheck className="mr-2 h-4 w-4" /> View My Customers</Button></Link>
            )}
             <Link href={currentUser.role === 'admin' ? "/admin/performance" : "/employee/analytics"} passHref>
                <Button variant="default" className="w-full justify-start bg-primary hover:bg-primary/90">
                    <PieChart className="mr-2 h-4 w-4" /> View Performance Analytics
                </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg overflow-hidden">
            <CardHeader>
                <CardTitle className="font-headline">Welcome to Stratagem CRM</CardTitle>
                <CardDescription>Your central hub for customer relationship management.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Stratagem CRM empowers your team to build stronger customer relationships, streamline workflows, and drive growth. Explore the features and make the most of your data.
                </p>
                <div className="aspect-video relative rounded-md overflow-hidden">
                    <Image 
                        src="https://placehold.co/600x338/e5eaf7/2962ff" // Placeholder for a relevant image
                        alt="CRM Dashboard Illustration" 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="team collaboration office"
                    />
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
