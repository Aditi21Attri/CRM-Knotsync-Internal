"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { navItems, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { LogOut, Settings } from "lucide-react";
import { useReminderBadge } from "@/hooks/useFollowUpNotifications";

export function SidebarContents() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { state: sidebarState } = useSidebar(); // 'expanded' or 'collapsed'
  const { pendingCount, overdueCount, hasOverdue } = useReminderBadge();

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentUser.role));
  return (
    <div className="flex h-full flex-col">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-200",
          sidebarState === 'collapsed' && "justify-center"
        )}>
          <Avatar className="h-10 w-10 flex-shrink-0">
             <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar" />
             <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
               {getInitials(currentUser.name)}
             </AvatarFallback>
          </Avatar>
          <div className={cn(
            "flex flex-col overflow-hidden transition-all duration-200",
            sidebarState === 'collapsed' && "hidden"
          )}>
            <span className="font-semibold text-sidebar-foreground truncate">{currentUser.name}</span>
            <span className="text-xs text-sidebar-foreground/70 truncate">{currentUser.email}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {filteredNavItems.map((item) => {
            // Add badge for follow-up reminder pages
            const showReminderBadge = (item.href === '/admin/follow-ups' || item.href === '/employee/follow-ups') && pendingCount > 0;
            const badgeText = showReminderBadge ? pendingCount.toString() : item.badge;
            const badgeVariant = hasOverdue ? 'destructive' : undefined;
            
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                    tooltip={sidebarState === 'collapsed' ? item.tooltip || item.label : undefined}
                    aria-label={item.label}
                    className="w-full"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className={cn(
                      "transition-all duration-200 overflow-hidden",
                      sidebarState === 'collapsed' && "hidden"
                    )}>
                      {item.label}
                    </span>
                    {badgeText && (
                      <SidebarMenuBadge className={cn(
                        "ml-auto",
                        hasOverdue && showReminderBadge && 'bg-red-500 text-white',
                        sidebarState === 'collapsed' && "hidden"
                      )}>
                        {badgeText}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>      <SidebarFooter className="p-4 border-t border-sidebar-border">
         <Button 
           variant="ghost" 
           className={cn(
             "w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
             sidebarState === 'collapsed' && "justify-center px-2"
           )} 
           onClick={logout} 
           aria-label="Log out"
         >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={cn(
              "transition-all duration-200",
              sidebarState === 'collapsed' && "hidden"
            )}>
              Log Out
            </span>
          </Button>      </SidebarFooter>
    </div>
  );
}
