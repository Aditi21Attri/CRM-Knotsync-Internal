'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LeadScoringSystem } from '@/components/immigration/LeadScoringSystem';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AnimatedPage } from '@/components/ui/animated-page';
import { PageHeader } from '@/components/shared/PageHeader';
import { getImmigrationCustomers } from '@/lib/actions/immigrationActions';
import { useState, useEffect } from 'react';
import type { ImmigrationCustomer } from '@/lib/types';

export default function LeadScoringPage() {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<ImmigrationCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const data = await getImmigrationCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error loading immigration customers:', error);
        setError('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      loadCustomers();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <LoadingSpinner message="Loading lead scoring data..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AnimatedPage>
        <div className="text-center py-10">Please log in to view lead scoring.</div>
      </AnimatedPage>
    );
  }
  if (error) {
    return (
      <AnimatedPage>
        <div className="text-center py-10 text-red-600">
          {error}
        </div>
      </AnimatedPage>
    );
  }return (
    <AnimatedPage>
      <PageHeader
        title="Lead Scoring & Management"
        description="AI-powered lead scoring to prioritize high-value prospects"
      />
      <LeadScoringSystem customers={customers} />
    </AnimatedPage>
  );
}
