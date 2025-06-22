'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ImmigrationDashboard } from '@/components/immigration/ImmigrationDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AnimatedPage } from '@/components/ui/animated-page';
import { useState, useEffect } from 'react';
import { getImmigrationCustomers } from '@/lib/actions/immigrationActions';
import type { ImmigrationCustomer } from '@/lib/types';

export default function ImmigrationPage() {
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
        // Fallback to demo data if database fails
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
        <LoadingSpinner message="Loading immigration dashboard..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AnimatedPage>
        <div className="text-center py-10">Please log in to view the immigration dashboard.</div>
      </AnimatedPage>
    );
  }

  return <ImmigrationDashboard customers={customers} currentUser={currentUser} />;
}
