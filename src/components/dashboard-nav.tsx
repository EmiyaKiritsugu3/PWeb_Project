'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  FlaskConical,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { logout } from '@/app/actions/auth';
import { FINANCIAL_ROUTES } from '@/lib/constants';

const allNavItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/dashboard/alunos', icon: <Users />, label: 'Alunos' },
  { href: '/dashboard/treinos', icon: <Dumbbell />, label: 'Treinos' },
  { href: '/dashboard/financeiro', icon: <DollarSign />, label: 'Financeiro' },
  { href: '/dashboard/planos', icon: <FileText />, label: 'Planos' },
];

if (process.env.NODE_ENV === 'development') {
  allNavItems.push({ href: '/dashboard/dev', icon: <FlaskConical />, label: 'Dev' });
}

interface DashboardNavProps {
  role: string;
}

export function DashboardNav({ role }: Readonly<DashboardNavProps>) {
  const pathname = usePathname();

  const navItems =
    role === 'GERENTE'
      ? allNavItems
      : allNavItems.filter((item) => !FINANCIAL_ROUTES.some((r) => item.href.startsWith(r)));

  const isActive = (href: string) => {
    // Make it active for sub-paths as well, except for the main dashboard page
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarMenu className="gap-2">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} className="block w-full">
              <SidebarMenuButton
                isActive={active}
                tooltip={item.label}
                className={`w-full transition-all duration-300 h-11 px-4 rounded-xl border border-transparent
                  ${
                    active
                      ? 'bg-primary/10 text-primary border-primary/20 glow-cyan shadow-primary/5 font-bold'
                      : 'hover:bg-white/5 hover:text-foreground text-muted-foreground'
                  }`}
              >
                <div
                  className={`${active ? 'text-primary scale-110' : 'group-hover:text-foreground'} transition-all duration-300`}
                >
                  {item.icon}
                </div>
                <span className="ml-2">{item.label}</span>
                {active && (
                  <div className="absolute left-0 w-1 h-5 bg-primary rounded-full blur-[2px] animate-pulse"></div>
                )}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function DashboardNavBottom() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Configurações">
          <Settings />
          <span>Configurações</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <form action={logout} className="w-full">
          <SidebarMenuButton tooltip="Sair" type="submit" className="w-full">
            <LogOut />
            <span>Sair</span>
          </SidebarMenuButton>
        </form>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
