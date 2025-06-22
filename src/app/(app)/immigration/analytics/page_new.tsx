'use client';

import { useAuth } from '@/contexts/AuthContext';
import { RevenueAnalytics } from '@/components/immigration/RevenueAnalytics';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AnimatedPage } from '@/components/ui/animated-page';
import { PageHeader } from '@/components/shared/PageHeader';
import { useState, useEffect } from 'react';
import { getImmigrationCustomers } from '@/lib/actions/immigrationActions';
import type { ImmigrationCustomer } from '@/lib/types';

export default function AnalyticsPage() {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<ImmigrationCustomer[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        const immigrationCustomers = await getImmigrationCustomers();
        setCustomers(immigrationCustomers);
      } catch (error) {
        console.error('Failed to load immigration customers:', error);
        setCustomers([]);
      } finally {
        setDataLoading(false);
      }
    };

    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <LoadingSpinner message="Loading analytics data..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AnimatedPage>
        <div className="text-center py-10">Please log in to view analytics.</div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Immigration Revenue Analytics"
        description="Comprehensive revenue analytics and insights for immigration services"
      />
      <RevenueAnalytics customers={customers} />
    </AnimatedPage>
  );
}
