import type { UserRole } from "./types";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, UserPlus, FileInput, BarChart3, Briefcase, UserCheck, Settings } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
  badge?: string; // Optional badge text
  tooltip?: string; // Optional tooltip for collapsed state
}

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "employee"],
    tooltip: "Dashboard"
  },
  {
    href: "/admin/employees",
    label: "Manage Employees",
    icon: Users,
    roles: ["admin"],
    tooltip: "Employees"
  },
  {
    href: "/admin/customers",
    label: "All Customers",
    icon: Briefcase,
    roles: ["admin"],
    tooltip: "Customers"
  },
  {
    href: "/admin/import",
    label: "Import Data",
    icon: FileInput,
    roles: ["admin"],
    tooltip: "Import"
  },
  {
    href: "/admin/performance",
    label: "Performance Tool",
    icon: BarChart3, // Using BarChart3 as a proxy for performance/analytics
    roles: ["admin"],
    tooltip: "Performance"
  },
  {
    href: "/admin/leads",
    label: "Leads",
    icon: UserPlus,
    roles: ["admin"],
    tooltip: "Leads"
  },
  {
    href: "/employee/my-customers",
    label: "My Customers",
    icon: UserCheck, // Using UserCheck for assigned customers
    roles: ["employee"],
    tooltip: "My Customers"
  },
  {
    href: "/employee/analytics",
    label: "My Analytics",
    icon: BarChart3,
    roles: ["employee"],
    tooltip: "Analytics"
  },
  {
    href: "/employee/assigned-leads",
    label: "Assigned Leads",
    icon: UserPlus,
    roles: ["employee"],
    tooltip: "Assigned Leads"
  },
  // Example of a group with sub-items (if needed later)
  // {
  //   href: "/settings",
  //   label: "Settings",
  //   icon: Settings,
  //   roles: ["admin"],
  //   tooltip: "Settings",
  //   children: [
  //     { href: "/settings/general", label: "General", icon: Settings, roles: ["admin"], tooltip: "General Settings" },
  //     { href: "/settings/billing", label: "Billing", icon: CreditCard, roles: ["admin"], tooltip: "Billing" },
  //   ]
  // }
];
