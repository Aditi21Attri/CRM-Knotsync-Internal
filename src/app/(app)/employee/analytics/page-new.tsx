"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { AnimatedCard, AnimatedCardHeader, AnimatedCardContent } from "@/components/ui/animated-card";
import { AnimatedPage } from "@/components/ui/animated-page";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { TrendingUp, Users, Target, Clock, Zap, Award, Calendar, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { motion } from "framer-motion";

export default function EmployeeAnalyticsPage() {
  const { currentUser } = useAuth();
  const { customers, dataLoading } = useData();

  const analytics = useMemo(() => {
    if (!currentUser) return null;
    
    const myCustomers = customers.filter(customer => customer.assignedTo === currentUser.id);
    
    const total = myCustomers.length;
    const hot = myCustomers.filter(c => c.status === 'hot').length;
    const neutral = myCustomers.filter(c => c.status === 'neutral').length;
    const cold = myCustomers.filter(c => c.status === 'cold').length;
    
    const conversionRate = total > 0 ? (hot / total) * 100 : 0;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyContacted = myCustomers.filter(c => {
      if (!c.lastContacted) return false;
      return new Date(c.lastContacted) >= sevenDaysAgo;
    }).length;
    
    // Monthly breakdown for the chart
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthCustomers = myCustomers.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      });
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        total: monthCustomers.length,
        hot: monthCustomers.filter(c => c.status === 'hot').length,
        neutral: monthCustomers.filter(c => c.status === 'neutral').length,
        cold: monthCustomers.filter(c => c.status === 'cold').length,
      });
    }
    
    // Status distribution for pie chart
    const statusData = [
      { name: 'Hot', value: hot, fill: '#10b981', percentage: total > 0 ? (hot / total) * 100 : 0 },
      { name: 'Neutral', value: neutral, fill: '#f59e0b', percentage: total > 0 ? (neutral / total) * 100 : 0 },
      { name: 'Cold', value: cold, fill: '#ef4444', percentage: total > 0 ? (cold / total) * 100 : 0 },
    ];
    
    // Performance trends (weekly data)
    const weeklyData = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - 6);
      
      const weekCustomers = myCustomers.filter(c => {
        if (!c.lastContacted) return false;
        const contactDate = new Date(c.lastContacted);
        return contactDate >= weekStart && contactDate <= date;
      });
      
      weeklyData.push({
        week: `Week ${8 - i}`,
        contacted: weekCustomers.length,
        hotConverted: weekCustomers.filter(c => c.status === 'hot').length,
      });
    }
    
    return {
      total,
      hot,
      neutral,
      cold,
      conversionRate,
      recentlyContacted,
      monthlyData,
      statusData,
      weeklyData,
      myCustomers
    };
  }, [customers, currentUser]);

  if (dataLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner message="Loading analytics..." /></div>;
  }

  if (!analytics) {
    return <div className="text-center py-10">Unable to load analytics data.</div>;
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
            title="Performance Analytics"
            description="Track your customer engagement metrics and performance insights."
          />
        </div>
      </motion.div>

      {/* Key Performance Metrics */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <StatCard 
          title="Total Customers" 
          value={analytics.total} 
          icon={Users} 
          className="glassmorphism border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
        />
        <StatCard 
          title="Hot Leads" 
          value={analytics.hot} 
          icon={Zap} 
          className="glassmorphism border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${analytics.conversionRate.toFixed(1)}%`} 
          icon={Target} 
          className="glassmorphism border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
        />
        <StatCard 
          title="Recent Activity" 
          value={analytics.recentlyContacted} 
          icon={Clock} 
          className="glassmorphism border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-yellow-500/10"
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Customer Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <AnimatedCard className="glassmorphism border-border/50">
            <AnimatedCardHeader>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Customer Status Distribution
              </h3>
              <p className="text-muted-foreground">Breakdown of your customer engagement levels</p>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percentage }: any) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {analytics.statusData.map((entry, index) => (
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Monthly Customer Acquisition */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <AnimatedCard className="glassmorphism border-border/50">
            <AnimatedCardHeader>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Monthly Customer Growth
              </h3>
              <p className="text-muted-foreground">Customer acquisition and status over the last 6 months</p>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
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
                    <Bar dataKey="hot" fill="#10b981" name="Hot Leads" />
                    <Bar dataKey="neutral" fill="#f59e0b" name="Neutral" />
                    <Bar dataKey="cold" fill="#ef4444" name="Cold Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Weekly Activity Trends
            </h3>
            <p className="text-muted-foreground">Your customer contact activity and conversion performance</p>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="week" 
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
                  <Area 
                    type="monotone" 
                    dataKey="contacted" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    name="Customers Contacted"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hotConverted" 
                    stackId="2" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Hot Conversions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <AnimatedCard className="glassmorphism border-border/50">
          <AnimatedCardHeader>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-500" />
              Performance Insights
            </h3>
            <p className="text-muted-foreground">Key insights about your customer management performance</p>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 rounded-xl glassmorphism border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">{analytics.hot}</span>
                </div>
                <h4 className="font-semibold mb-2">Hot Lead Success</h4>
                <p className="text-sm text-muted-foreground">
                  You've successfully converted {analytics.hot} customers to hot leads. 
                  {analytics.conversionRate > 25 ? " Excellent work!" : analytics.conversionRate > 15 ? " Good progress!" : " Keep pushing!"}
                </p>
              </div>

              <div className="p-6 rounded-xl glassmorphism border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{analytics.recentlyContacted}</span>
                </div>
                <h4 className="font-semibold mb-2">Recent Activity</h4>
                <p className="text-sm text-muted-foreground">
                  You've contacted {analytics.recentlyContacted} customers in the last 7 days.
                  {analytics.recentlyContacted > analytics.total * 0.3 ? " Great engagement!" : " Consider increasing contact frequency."}
                </p>
              </div>

              <div className="p-6 rounded-xl glassmorphism border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-500" />
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{analytics.conversionRate.toFixed(1)}%</span>
                </div>
                <h4 className="font-semibold mb-2">Conversion Rate</h4>
                <p className="text-sm text-muted-foreground">
                  Your hot lead conversion rate is {analytics.conversionRate.toFixed(1)}%.
                  {analytics.conversionRate > 25 ? " Outstanding performance!" : analytics.conversionRate > 15 ? " Above average!" : " Room for improvement."}
                </p>
              </div>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 rounded-full blur-3xl" />
      </div>
    </AnimatedPage>
  );
}
