'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ComplianceChecker } from '@/components/immigration/ComplianceChecker';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AnimatedPage } from '@/components/ui/animated-page';
import { PageHeader } from '@/components/shared/PageHeader';
import { getImmigrationCustomers } from '@/lib/actions/immigrationActions';
import { useState, useEffect } from 'react';
import type { ImmigrationCustomer } from '@/lib/types';

export default function CompliancePage() {
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
        <LoadingSpinner message="Loading compliance data..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AnimatedPage>
        <div className="text-center py-10">Please log in to view compliance data.</div>
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
    );  return (
    <AnimatedPage>
      <PageHeader
        title="Immigration Compliance"
        description="Monitor compliance status and policy adherence for all immigration cases"
      />
      <div className="space-y-6">
        {customers.slice(0, 3).map((customer, index) => (
          <div key={customer.id || index} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              Compliance Check: {customer.name}
            </h3>
            <ComplianceChecker customer={customer} />
          </div>
        ))}
        {customers.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No immigration customers found.
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
