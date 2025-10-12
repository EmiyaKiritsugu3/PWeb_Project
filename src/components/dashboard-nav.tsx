"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  DollarSign, 
  FileText,
  Settings,
  LogOut
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
  { href: "/dashboard/alunos", icon: <Users />, label: "Alunos" },
  { href: "/dashboard/treinos", icon: <Dumbbell />, label: "Treinos" },
  { href: "/dashboard/financeiro", icon: <DollarSign />, label: "Financeiro" },
  { href: "/dashboard/planos", icon: <FileText />, label: "Planos" },
];

const bottomNavItems = [
    { href: "#", icon: <Settings />, label: "Configurações" },
    { href: "/", icon: <LogOut />, label: "Sair" },
]

export function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              isActive={isActive(item.href)}
              tooltip={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function DashboardNavBottom() {
    return (
        <SidebarMenu>
        {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
            <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton tooltip={item.label}>
                {item.icon}
                <span>{item.label}</span>
                </SidebarMenuButton>
            </Link>
            </SidebarMenuItem>
        ))}
        </SidebarMenu>
    )
}
