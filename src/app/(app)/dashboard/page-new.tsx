'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { motion } from 'framer-motion';
import { Users, Target, TrendingUp, Calendar, DollarSign, Activity, Briefcase, UserCheck, PieChart, TrendingDown, FileInput } from 'lucide-react';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';
import { AnimatedPage, AnimatedGrid } from '@/components/ui/animated-page';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { customers, users, employees, dataLoading } = useData();

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <LoadingSpinner message="Loading dashboard data..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AnimatedPage>
        <div className="text-center py-10">Please log in to view the dashboard.</div>
      </AnimatedPage>
    );
  }

  const totalCustomers = customers.length;
  const assignedCustomers = customers.filter(c => c.assignedTo === currentUser.id).length;
  const hotCustomers = customers.filter(c => c.status === 'hot' && (currentUser.role === 'admin' || c.assignedTo === currentUser.id)).length;
  const coldCustomers = customers.filter(c => c.status === 'cold' && (currentUser.role === 'admin' || c.assignedTo === currentUser.id)).length;
  const neutralCustomers = customers.filter(c => c.status === 'neutral' && (currentUser.role === 'admin' || c.assignedTo === currentUser.id)).length;

  const stats = currentUser.role === 'admin' 
    ? [
        {
          title: 'Total Customers',
          value: totalCustomers.toString(),
          change: '+12.5%',
          trend: 'up',
          icon: Briefcase,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          description: 'All customers in the system'
        },
        {
          title: 'Total Employees',
          value: employees.length.toString(),
          change: '+2',
          trend: 'up',
          icon: Users,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          description: 'Active employees in your team'
        },
        {
          title: 'Hot Leads',
          value: hotCustomers.toString(),
          change: '+8.3%',
          trend: 'up',
          icon: TrendingUp,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
          description: 'High-potential leads system-wide'
        },
        {
          title: 'Cold Leads',
          value: coldCustomers.toString(),
          change: '-2.1%',
          trend: 'down',
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          description: 'Leads that opted out system-wide'
        },
        {
          title: 'Neutral Leads',
          value: neutralCustomers.toString(),
          change: '5 pending',
          trend: 'neutral',
          icon: PieChart,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/30',
          description: 'Leads on hold system-wide'
        },
        {
          title: 'Team Activity',
          value: '89%',
          change: '+3.4%',
          trend: 'up',
          icon: Activity,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
          description: 'Overall team engagement'
        },
      ]
    : [
        {
          title: 'My Customers',
          value: assignedCustomers.toString(),
          change: '+5',
          trend: 'up',
          icon: UserCheck,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          description: 'Customers you are managing'
        },
        {
          title: 'Hot Leads',
          value: hotCustomers.toString(),
          change: '+3',
          trend: 'up',
          icon: TrendingUp,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
          description: 'Your high-potential leads'
        },
        {
          title: 'Cold Leads',
          value: coldCustomers.toString(),
          change: '-1',
          trend: 'down',
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          description: 'Your leads that opted out'
        },
        {
          title: 'Neutral Leads',
          value: neutralCustomers.toString(),
          change: '2 pending',
          trend: 'neutral',
          icon: PieChart,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/30',
          description: 'Your leads on hold'
        },
        {
          title: 'Follow-ups',
          value: '12',
          change: '3 overdue',
          trend: 'warning',
          icon: Calendar,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-950/30',
          description: 'Scheduled follow-ups'
        },
        {
          title: 'This Month',
          value: '$24,580',
          change: '+18.7%',
          trend: 'up',
          icon: DollarSign,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          description: 'Revenue generated'
        },
      ];

  const quickActions = currentUser.role === 'admin'
    ? [
        { label: 'Import Data', href: '/admin/import', icon: FileInput, color: 'bg-blue-500' },
        { label: 'Manage Employees', href: '/admin/employees', icon: Users, color: 'bg-green-500' },
        { label: 'View Customers', href: '/admin/customers', icon: Briefcase, color: 'bg-purple-500' },
        { label: 'Performance', href: '/admin/performance', icon: PieChart, color: 'bg-orange-500' },
      ]
    : [
        { label: 'My Customers', href: '/employee/my-customers', icon: UserCheck, color: 'bg-blue-500' },
        { label: 'Assigned Leads', href: '/employee/assigned-leads', icon: Target, color: 'bg-green-500' },
        { label: 'Follow-ups', href: '/employee/follow-ups', icon: Calendar, color: 'bg-purple-500' },
        { label: 'Analytics', href: '/employee/analytics', icon: PieChart, color: 'bg-orange-500' },
      ];

  return (
    <AnimatedPage className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold tracking-tight gradient-text">
          Welcome, {currentUser.name}!
        </h1>
        <p className="text-lg text-muted-foreground">
          {currentUser.role === 'admin' 
            ? "Oversee your CRM operations and team performance." 
            : "Manage your customers and track your progress."}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <AnimatedCard 
              key={stat.title} 
              variant="glass"
              delay={index * 0.1}
              className="relative overflow-hidden group"
            >
              <AnimatedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <AnimatedCardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </AnimatedCardTitle>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-2 rounded-lg ${stat.bgColor}`}
                >
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </motion.div>
              </AnimatedCardHeader>
              
              <AnimatedCardContent>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                  className="space-y-2"
                >
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        stat.trend === 'up' ? 'default' : 
                        stat.trend === 'down' ? 'destructive' : 
                        stat.trend === 'warning' ? 'destructive' : 
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground">from last month</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </motion.div>
              </AnimatedCardContent>

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
            </AnimatedCard>
          );
        })}
      </AnimatedGrid>

      {/* Quick Actions */}
      <AnimatedCard variant="gradient" delay={0.6}>
        <AnimatedCardHeader>
          <AnimatedCardTitle className="text-xl">Quick Actions</AnimatedCardTitle>
        </AnimatedCardHeader>
        <AnimatedCardContent>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.8,
                },
              },
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                >
                  <Link href={action.href}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-all duration-200 group cursor-pointer"
                    >
                      <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatedCardContent>
      </AnimatedCard>

      {/* Welcome Card */}
      <AnimatedCard variant="glass" delay={0.8}>
        <AnimatedCardHeader>
          <AnimatedCardTitle className="text-xl">Welcome to KnotSync CRM</AnimatedCardTitle>
        </AnimatedCardHeader>
        <AnimatedCardContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">
              KnotSync CRM empowers your team to build stronger customer relationships, 
              streamline workflows, and drive growth. Explore the features and make the most of your data.
            </p>
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-center"
              >
                <Activity className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold text-primary">Your CRM Dashboard</p>
                <p className="text-sm text-muted-foreground">Manage relationships, track progress</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatedCardContent>
      </AnimatedCard>

      {/* Background Elements */}
      <motion.div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float [animation-delay:1s]" />
      </motion.div>
    </AnimatedPage>
  );
}
