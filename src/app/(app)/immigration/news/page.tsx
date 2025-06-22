'use client';

import { ImmigrationNewsFeed } from '@/components/immigration/ImmigrationNewsFeed';
import { PageHeader } from '@/components/shared/PageHeader';
import { AnimatedPage } from '@/components/ui/animated-page';

export default function NewsPage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Immigration News & Updates"
        description="Stay informed with the latest immigration policies, news, and regulatory changes"
      />
      <ImmigrationNewsFeed />
    </AnimatedPage>
  );
}
