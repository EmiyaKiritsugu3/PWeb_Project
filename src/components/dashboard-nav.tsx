
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "@/components/ui/sidebar";
import { useAuth } from "@/firebase";

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
  { href: "/dashboard/alunos", icon: <Users />, label: "Alunos" },
  { href: "/dashboard/treinos", icon: <Dumbbell />, label: "Treinos" },
  { href: "/dashboard/financeiro", icon: <DollarSign />, label: "Financeiro" },
  { href: "/dashboard/planos", icon: <FileText />, label: "Planos" },
];

export function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
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
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        auth?.signOut();
        router.push('/login');
    };

    const bottomNavItems = [
        { href: "#", icon: <Settings />, label: "Configurações", action: () => {} },
        { href: "#", icon: <LogOut />, label: "Sair", action: handleLogout },
    ];

    return (
        <SidebarMenu>
        {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
                <SidebarMenuButton tooltip={item.label} onClick={item.action}>
                    {item.icon}
                    <span>{item.label}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
        </SidebarMenu>
    )
}
