'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { navItems, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { LogOut, Settings, Bell } from 'lucide-react';
import { useReminderBadge } from '@/hooks/useFollowUpNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function SidebarContents() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { state: sidebarState } = useSidebar();
  const { pendingCount, overdueCount, hasOverdue } = useReminderBadge();

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentUser.role));
  
  // Separate core CRM and immigration items
  const coreNavItems = filteredNavItems.filter(item => 
    !item.href.startsWith('/immigration')
  );
  
  const immigrationNavItems = filteredNavItems.filter(item => 
    item.href.startsWith('/immigration')
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'flex items-center gap-3 transition-all duration-200',
            sidebarState === 'collapsed' && 'justify-center'
          )}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-sidebar-border shadow-md">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          <AnimatePresence>
            {sidebarState !== 'collapsed' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="font-semibold text-sidebar-foreground truncate">
                  {currentUser.name}
                </span>
                <span className="text-xs text-sidebar-foreground/70 truncate">
                  {currentUser.email}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="flex-1 p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Role Indicator */}
          <motion.div 
            variants={itemVariants}
            className="mb-6"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/30 border border-sidebar-border/30">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {sidebarState !== 'collapsed' && (
                <span className="text-sm font-medium text-sidebar-foreground">
                  {currentUser.role === 'admin' ? 'Admin Panel' : 'Employee Dashboard'}
                </span>
              )}
            </div>
          </motion.div>          {/* Core CRM Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium mb-2">
              Core CRM
            </SidebarGroupLabel>
            <SidebarMenu>
              {coreNavItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const showBadge = item.badge && (pendingCount > 0 || overdueCount > 0);
                const badgeCount = item.badge === 'pending' ? pendingCount : item.badge === 'overdue' ? overdueCount : 0;

                return (
                  <motion.div key={item.href} variants={itemVariants}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          'group relative transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          isActive && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                        )}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              'transition-colors duration-200',
                              isActive 
                                ? 'text-sidebar-primary-foreground' 
                                : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </motion.div>
                            {sidebarState !== 'collapsed' && (
                            <span className="truncate">{item.label}</span>
                          )}
                          
                          {showBadge && badgeCount > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                            >
                              <SidebarMenuBadge className={cn(
                                'ml-auto',
                                hasOverdue && item.badge === 'overdue' 
                                  ? 'bg-destructive text-destructive-foreground' 
                                  : 'bg-primary text-primary-foreground'
                              )}>
                                {badgeCount}
                              </SidebarMenuBadge>
                            </motion.div>
                          )}
                        </Link>
                      </SidebarMenuButton>
                      
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary-foreground"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Immigration Services Navigation */}
          {immigrationNavItems.length > 0 && (
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium mb-2">
                Immigration Services
              </SidebarGroupLabel>
              <SidebarMenu>
                {immigrationNavItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <motion.div key={item.href} variants={itemVariants}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            'group relative transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            isActive && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={cn(
                                'transition-colors duration-200',
                                isActive 
                                  ? 'text-sidebar-primary-foreground' 
                                  : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </motion.div>
                              {sidebarState !== 'collapsed' && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                        
                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary-foreground"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          )}

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="mt-8"
          >
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium mb-2">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all duration-200"
                  >
                    <Bell className="h-4 w-4" />
                    {sidebarState !== 'collapsed' && (
                      <>
                        <span>Notifications</span>
                        <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] text-xs">
                          2
                        </Badge>
                      </>
                    )}
                  </motion.button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </motion.div>
        </motion.div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="space-y-2"
        >
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            {sidebarState !== 'collapsed' && (
              <span className="text-xs text-success">System Online</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Settings className="h-4 w-4" />
                {sidebarState !== 'collapsed' && <span className="ml-2">Settings</span>}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full justify-start text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                {sidebarState !== 'collapsed' && <span className="ml-2">Logout</span>}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </SidebarFooter>
    </div>
  );
}
