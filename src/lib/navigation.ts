import type { UserRole } from "./types";
import type { LucideIcon } from "lucide-react";
import { 
  LayoutDashboard, Users, UserPlus, FileInput, BarChart3, Briefcase, 
  UserCheck, Settings, Bell, Globe, Shield, Newspaper, DollarSign, 
  Target, CreditCard, User 
} from "lucide-react";

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
  },  {
    href: "/admin/import",
    label: "Import Data",
    icon: FileInput,
    roles: ["admin"],
    tooltip: "Import"
  },
  {
    href: "/admin/data-seeding",
    label: "Seed Sample Data",
    icon: BarChart3,
    roles: ["admin"],
    tooltip: "Seed Data"
  },
  {
    href: "/admin/performance",
    label: "Performance Tool",
    icon: BarChart3, // Using BarChart3 as a proxy for performance/analytics
    roles: ["admin"],
    tooltip: "Performance"
  },
  {
    href: "/admin/follow-ups",
    label: "Follow-up Reminders",
    icon: Bell,
    roles: ["admin"],
    tooltip: "Follow-ups"
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
  {
    href: "/employee/follow-ups",
    label: "My Follow-ups",
    icon: Bell,
    roles: ["employee"],
    tooltip: "Follow-ups"  },
  // Immigration Services Section
  {
    href: "/immigration",
    label: "Immigration Hub",
    icon: Globe,
    roles: ["admin", "employee"],
    tooltip: "Immigration Services"
  },
  {
    href: "/immigration/compliance",
    label: "Compliance Monitor",
    icon: Shield,
    roles: ["admin", "employee"],
    tooltip: "Compliance"
  },
  {
    href: "/immigration/news",
    label: "Immigration News",
    icon: Newspaper,
    roles: ["admin", "employee"],
    tooltip: "News & Updates"
  },
  {
    href: "/immigration/analytics",
    label: "Revenue Analytics",
    icon: DollarSign,
    roles: ["admin"],
    tooltip: "Revenue Analytics"
  },
  {
    href: "/immigration/leads",
    label: "Lead Scoring",
    icon: Target,
    roles: ["admin", "employee"],
    tooltip: "Lead Scoring"
  },
  {
    href: "/immigration/portal",
    label: "Client Portal",
    icon: User,
    roles: ["admin", "employee"],
    tooltip: "Client Portal"
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
