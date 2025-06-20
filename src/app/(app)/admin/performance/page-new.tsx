"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PerformanceSummaryTool } from "@/components/admin/PerformanceSummaryTool";
import { StatCard } from "@/components/shared/StatCard";
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent } from "@/components/ui/animated-card";
import { AnimatedPage } from "@/components/ui/animated-page";
import { useData } from "@/contexts/DataContext";
import type { User, Customer, CustomerStatus } from "@/lib/types";
import { BarChartBig, Users, CheckCircle, XCircle, PieChart, TrendingUp, Award, UserCheck, LineChart, Target, Zap } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { motion } from "framer-motion";

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

  const overallStatusCounts = useMemo(() => {
    if (!customers) return { total: 0, hot: 0, neutral: 0, cold: 0 };
    return {
      total: customers.length,
      hot: customers.filter(c => c.status === 'hot').length,
      neutral: customers.filter(c => c.status === 'neutral').length,
      cold: customers.filter(c => c.status === 'cold').length,
    };
  }, [customers]);

  const chartData = employeePerformanceData.map(emp => ({
    name: emp.employee.name.split(' ').slice(0, 2).join(' '), // First two names for readability
    hot: emp.hot,
    neutral: emp.neutral,
    cold: emp.cold,
    total: emp.totalAssigned,
  }));

  const pieData = [
    { name: 'Hot', count: overallStatusCounts.hot, fill: 'hsl(var(--chart-3))' },
    { name: 'Neutral', count: overallStatusCounts.neutral, fill: 'hsl(var(--chart-2))' },
    { name: 'Cold', count: overallStatusCounts.cold, fill: 'hsl(var(--chart-1))' },
  ];

  const topPerformers = employeePerformanceData
    .sort((a, b) => b.hot - a.hot)
    .slice(0, 3);

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading performance data..." /></div>;
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
            title="Performance & Analytics Center"
            description="Comprehensive insights into team performance and customer engagement metrics."
          />
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <StatCard 
          title="Active Employees" 
          value={employees.length} 
          icon={Users} 
          className="glassmorphism border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
        />
        <StatCard 
          title="Total Customers" 
          value={overallStatusCounts.total} 
          icon={BarChartBig} 
          className="glassmorphism border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
        />
        <StatCard 
          title="Hot Leads" 
          value={overallStatusCounts.hot} 
          icon={TrendingUp} 
          className="glassmorphism border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${overallStatusCounts.total > 0 ? Math.round((overallStatusCounts.hot / overallStatusCounts.total) * 100) : 0}%`} 
          icon={Target} 
          className="glassmorphism border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-yellow-500/10"
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Employee Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <AnimatedCard className="glassmorphism border-border/50">
            <AnimatedCardHeader>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Employee Performance Overview
              </h3>
              <p className="text-muted-foreground">Customer status distribution by team member</p>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="hot" fill="hsl(var(--chart-3))" name="Hot Leads" />
                    <Bar dataKey="neutral" fill="hsl(var(--chart-2))" name="Neutral" />
                    <Bar dataKey="cold" fill="hsl(var(--chart-1))" name="Cold Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Overall Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <AnimatedCard className="glassmorphism border-border/50">
            <AnimatedCardHeader>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Customer Status Distribution
              </h3>
              <p className="text-muted-foreground">Overall breakdown of customer engagement levels</p>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label={({ name, value, percent }: any) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-500" />
              Top Performers
            </h3>
            <p className="text-muted-foreground">Employees with the highest hot lead conversion</p>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {topPerformers.map((performer, index) => (
                <motion.div
                  key={performer.employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  className="relative p-6 rounded-xl glassmorphism border border-border/50 hover:border-primary/30 transition-all duration-300"
                >
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                      #1
                    </div>
                  )}
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={performer.employee.avatarUrl} alt={performer.employee.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                        {getInitials(performer.employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{performer.employee.name}</p>
                      <p className="text-sm text-muted-foreground">{performer.employee.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Hot Leads</span>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        <Zap className="mr-1 h-3 w-3" />
                        {performer.hot}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Assigned</span>
                      <span className="font-semibold">{performer.totalAssigned}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-semibold text-primary">
                        {performer.totalAssigned > 0 ? Math.round((performer.hot / performer.totalAssigned) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Detailed Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Detailed Performance Breakdown
            </h3>
            <p className="text-muted-foreground">Comprehensive view of all employee metrics</p>
          </AnimatedCardHeader>
          <AnimatedCardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="w-16">Avatar</TableHead>
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold text-center">Total Assigned</TableHead>
                    <TableHead className="font-semibold text-center">Hot Leads</TableHead>
                    <TableHead className="font-semibold text-center">Neutral</TableHead>
                    <TableHead className="font-semibold text-center">Cold Leads</TableHead>
                    <TableHead className="font-semibold text-center">Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeePerformanceData.map((emp, index) => (
                    <motion.tr
                      key={emp.employee.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05, duration: 0.5 }}
                      className="border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Avatar className="h-10 w-10 border border-border/50">
                          <AvatarImage src={emp.employee.avatarUrl} alt={emp.employee.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-sm">
                            {getInitials(emp.employee.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{emp.employee.name}</TableCell>
                      <TableCell>
                        <Badge variant={emp.employee.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                          {emp.employee.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{emp.totalAssigned}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          {emp.hot}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          {emp.neutral}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                          {emp.cold}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-primary">
                        {emp.totalAssigned > 0 ? Math.round((emp.hot / emp.totalAssigned) * 100) : 0}%
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
                {employeePerformanceData.length === 0 && (
                  <TableCaption className="py-8">No employee data available.</TableCaption>
                )}
              </Table>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* AI Performance Summary Tool */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <PerformanceSummaryTool />
      </motion.div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl" />
      </div>
    </AnimatedPage>
  );
}
