'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, Calendar,
  PieChart, BarChart3, Target, Globe, Clock, CreditCard,
  FileText, Award, AlertTriangle, RefreshCw, Download,
  Filter, Search, Eye, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie
} from 'recharts';
import type { ImmigrationCustomer, VisaType, CountryCode } from '@/lib/types';

interface RevenueAnalyticsProps {
  customers: ImmigrationCustomer[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  onExport?: (data: any) => void;
}

interface RevenueMetrics {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  averagePackageValue: number;
  conversionRate: number;
  projectedRevenue: number;
  customerLifetimeValue: number;
}

interface PackageTypeRevenue {
  packageType: string;
  revenue: number;
  count: number;
  averageValue: number;
  profitMargin: number;
}

interface CountryRevenue {
  country: CountryCode;
  revenue: number;
  customers: number;
  averageValue: number;
  growthRate: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  paid: number;
  pending: number;
  customers: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function RevenueAnalytics({ customers, dateRange, onExport }: RevenueAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedPackage, setSelectedPackage] = useState<string>('all');

  // Calculate metrics
  const metrics = useMemo((): RevenueMetrics => {
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalFees, 0);
    const totalPaid = customers.reduce((sum, customer) => sum + customer.paidAmount, 0);
    const totalPending = customers.reduce((sum, customer) => sum + customer.remainingAmount, 0);
    
    const overdueCustomers = customers.filter(c => 
      c.paymentStatus === 'overdue' || 
      (c.paymentStatus === 'partial' && c.remainingAmount > 0)
    );
    const totalOverdue = overdueCustomers.reduce((sum, customer) => sum + customer.remainingAmount, 0);
    
    const averagePackageValue = totalRevenue / customers.length || 0;
    const paidCustomers = customers.filter(c => c.paymentStatus === 'completed').length;
    const conversionRate = (paidCustomers / customers.length) * 100 || 0;
    
    // Simple projection based on current pipeline
    const projectedRevenue = totalPending * 0.8; // Assume 80% collection rate
    
    const customerLifetimeValue = customers.reduce((sum, customer) => 
      sum + (customer.customerLifetimeValue || customer.totalFees), 0
    ) / customers.length || 0;

    return {
      totalRevenue,
      totalPaid,
      totalPending,
      totalOverdue,
      averagePackageValue,
      conversionRate,
      projectedRevenue,
      customerLifetimeValue
    };
  }, [customers]);

  // Package type revenue breakdown
  const packageRevenue = useMemo((): PackageTypeRevenue[] => {
    const packages = customers.reduce((acc, customer) => {
      const packageType = customer.packageType || 'Standard';
      if (!acc[packageType]) {
        acc[packageType] = {
          packageType,
          revenue: 0,
          count: 0,
          averageValue: 0,
          profitMargin: 0
        };
      }
      acc[packageType].revenue += customer.totalFees;
      acc[packageType].count += 1;
      return acc;
    }, {} as Record<string, PackageTypeRevenue>);

    return Object.values(packages).map(pkg => ({
      ...pkg,
      averageValue: pkg.revenue / pkg.count,
      profitMargin: Math.random() * 30 + 20 // Mock profit margin 20-50%
    }));
  }, [customers]);

  // Country revenue breakdown
  const countryRevenue = useMemo((): CountryRevenue[] => {
    const countries = customers.reduce((acc, customer) => {
      const country = customer.destinationCountry;
      if (!acc[country]) {
        acc[country] = {
          country,
          revenue: 0,
          customers: 0,
          averageValue: 0,
          growthRate: 0
        };
      }
      acc[country].revenue += customer.totalFees;
      acc[country].customers += 1;
      return acc;
    }, {} as Record<string, CountryRevenue>);

    return Object.values(countries).map(country => ({
      ...country,
      averageValue: country.revenue / country.customers,
      growthRate: Math.random() * 40 - 20 // Mock growth rate -20% to +20%
    })).sort((a, b) => b.revenue - a.revenue);
  }, [customers]);

  // Monthly revenue data
  const monthlyRevenue = useMemo((): MonthlyRevenue[] => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      
      // Mock monthly data - in real app, this would come from actual data
      const monthCustomers = customers.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate.getFullYear() === date.getFullYear() && 
               createdDate.getMonth() === date.getMonth();
      });

      const revenue = monthCustomers.reduce((sum, c) => sum + c.totalFees, 0);
      const paid = monthCustomers.reduce((sum, c) => sum + c.paidAmount, 0);
      const pending = monthCustomers.reduce((sum, c) => sum + c.remainingAmount, 0);

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue,
        paid,
        pending,
        customers: monthCustomers.length
      });
    }
    
    return months;
  }, [customers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Track financial performance and immigration service revenue
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last Year</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={() => onExport?.(metrics)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Collected
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(metrics.totalPaid)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {formatPercentage((metrics.totalPaid / metrics.totalRevenue) * 100)} collection rate
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {formatCurrency(metrics.totalPending)}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  From {customers.filter(c => c.remainingAmount > 0).length} customers
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Avg Package Value
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(metrics.averagePackageValue)}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  CLV: {formatCurrency(metrics.customerLifetimeValue)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), '']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0088FE" 
                      fill="#0088FE" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Paid', value: metrics.totalPaid, color: '#00C49F' },
                        { name: 'Pending', value: metrics.totalPending, color: '#FFBB28' },
                        { name: 'Overdue', value: metrics.totalOverdue, color: '#FF8042' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{formatPercentage(metrics.conversionRate)}</span>
                    <Badge className="bg-green-100 text-green-700">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +2.3%
                    </Badge>
                  </div>
                  <Progress value={metrics.conversionRate} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Customers with completed payments
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">+18.7%</span>
                    <Badge className="bg-green-100 text-green-700">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      MoM
                    </Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Month-over-month growth
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Collection Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">92.5%</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      Target: 95%
                    </Badge>
                  </div>
                  <Progress value={92.5} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Revenue collection rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Package Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={packageRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="packageType" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : Number(value),
                      name === 'revenue' ? 'Revenue' : 'Customers'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Destination Country</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">                {countryRevenue.slice(0, 8).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                        index % 5 === 0 ? 'bg-blue-500' :
                        index % 5 === 1 ? 'bg-green-500' :
                        index % 5 === 2 ? 'bg-yellow-500' :
                        index % 5 === 3 ? 'bg-orange-500' : 'bg-purple-500'
                      }`}>
                        {country.country}
                      </div>
                      <div>
                        <p className="font-medium">{country.country}</p>
                        <p className="text-sm text-muted-foreground">
                          {country.customers} customers • Avg: {formatCurrency(country.averageValue)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(country.revenue)}</p>
                      <p className={`text-sm flex items-center ${
                        country.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {country.growthRate >= 0 ? 
                          <TrendingUp className="h-3 w-3 mr-1" /> : 
                          <TrendingDown className="h-3 w-3 mr-1" />
                        }
                        {formatPercentage(Math.abs(country.growthRate))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Projected Next Quarter</span>
                    <span className="font-semibold">{formatCurrency(metrics.projectedRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pipeline Value</span>
                    <span className="font-semibold">{formatCurrency(metrics.totalPending)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Expected Collection Rate</span>
                    <span className="font-semibold">80%</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Strong Growth</p>
                      <p className="text-xs text-muted-foreground">
                        Revenue increased 18.7% month-over-month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Package Performance</p>
                      <p className="text-xs text-muted-foreground">
                        Premium packages show highest profit margins
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Collection Attention</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(metrics.totalOverdue)} in overdue payments
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
