"use client";

import React, { useEffect }  from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarContents } from "@/components/layout/SidebarContents";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowUpNotifications } from '@/hooks/useFollowUpNotifications';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize follow-up notifications
  useFollowUpNotifications();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.replace('/login');
      } else {
        // Role-based route protection
        if (pathname.startsWith('/admin') && currentUser.role !== 'admin') {
          router.replace('/dashboard'); // Or an access-denied page
        } else if (pathname.startsWith('/employee') && currentUser.role !== 'employee') {
          router.replace('/dashboard'); // Or an access-denied page
        }
      }
    }
  }, [currentUser, isLoading, router, pathname]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-muted-foreground">Loading Stratagem CRM...</p>
        </div>
      </div>
    );
  }
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <SidebarContents />
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

