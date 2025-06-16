
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

export function SidebarContents() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { state: sidebarState } = useSidebar(); // 'expanded' or 'collapsed'

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-200",
          sidebarState === 'collapsed' && "justify-center"
        )}>
          <Avatar className="h-10 w-10">
             <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar" />
             <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
          </Avatar>
          <div className={cn("flex flex-col", sidebarState === 'collapsed' && "hidden")}>
            <span className="font-semibold text-sidebar-foreground">{currentUser.name}</span>
            <span className="text-xs text-sidebar-foreground/70">{currentUser.email}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                  tooltip={sidebarState === 'collapsed' ? item.tooltip || item.label : undefined}
                  aria-label={item.label}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn(sidebarState === 'collapsed' && "hidden")}>{item.label}</span>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
         <Button variant="ghost" className={cn("w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", sidebarState === 'collapsed' && "justify-center")} onClick={logout} aria-label="Log out">
            <LogOut className="h-5 w-5" />
            <span className={cn(sidebarState === 'collapsed' && "hidden")}>Log Out</span>
          </Button>
      </SidebarFooter>
    </>
  );
}
