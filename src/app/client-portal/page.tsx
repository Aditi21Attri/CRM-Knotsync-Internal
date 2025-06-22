'use client';

import { useSearchParams } from 'next/navigation';
import { FullClientPortal } from '@/components/immigration/FullClientPortal';

export default function PublicClientPortalPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customer');
  const accessToken = searchParams.get('token');

  return (
    <FullClientPortal 
      customerId={customerId || undefined}
      accessToken={accessToken || undefined}
    />
  );
}
