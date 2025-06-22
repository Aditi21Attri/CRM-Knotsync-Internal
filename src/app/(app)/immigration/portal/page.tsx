'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ClientPortal } from '@/components/immigration/ClientPortal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AnimatedPage } from '@/components/ui/animated-page';
import { PageHeader } from '@/components/shared/PageHeader';
import { getImmigrationCustomers } from '@/lib/actions/immigrationActions';
import { useState, useEffect } from 'react';
import type { ImmigrationCustomer, PortalPermission } from '@/lib/types';

export default function ClientPortalPage() {
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
        <LoadingSpinner message="Loading client portal..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AnimatedPage>
        <div className="text-center py-10">Please log in to view the client portal.</div>
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
  }
  // Use first customer for demo
  const customer = customers[0];

  const portalAccess = {
    id: 'portal-1',
    customerId: customer?.id || 'demo-customer',
    email: customer?.email || 'demo@example.com',
    accessToken: 'demo-token',
    isActive: true,
    permissions: ['view_documents', 'upload_documents', 'view_timeline', 'view_payments', 'update_profile', 'chat_support', 'book_appointments', 'view_news'] as PortalPermission[],
    language: 'en' as const,
    createdAt: new Date().toISOString()
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="Client Portal"
        description="Dedicated portal for immigration clients to track their case progress and communicate"
      />
      {customer ? (
        <ClientPortal customer={customer} portalAccess={portalAccess} />
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          No customer data available for portal demo.
        </div>
      )}
    </AnimatedPage>
  );
}
