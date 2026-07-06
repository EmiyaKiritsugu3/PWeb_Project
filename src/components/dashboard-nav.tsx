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
  type LucideIcon,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { logout } from '@/app/actions/auth';
import { FINANCIAL_ROUTES } from '@/lib/constants';
import type { NavIconName } from '@/components/bottom-nav';

export type NavItemDef = {
  href: string;
  label: string;
  iconName: NavIconName;
};

const NAV_ITEM_DEFS: NavItemDef[] = [
  { href: '/dashboard', label: 'Dashboard', iconName: 'layout-dashboard' },
  { href: '/dashboard/alunos', label: 'Alunos', iconName: 'users' },
  { href: '/dashboard/treinos', label: 'Treinos', iconName: 'dumbbell' },
  { href: '/dashboard/financeiro', label: 'Financeiro', iconName: 'dollar-sign' },
  { href: '/dashboard/planos', label: 'Planos', iconName: 'file-text' },
];

// ponytail: dev item uses FlaskConical which has no NavIconName slot (dev stays sidebar-only, never reaches BottomNav)
const DEV_ITEM: NavItemDef = { href: '/dashboard/dev', label: 'Dev', iconName: 'dumbbell' };

function buildAllItems(): NavItemDef[] {
  const items = [...NAV_ITEM_DEFS];
  if (process.env.NODE_ENV === 'development') {
    items.push(DEV_ITEM);
  }
  return items;
}

export function getNavItems(role: string): NavItemDef[] {
  const all = buildAllItems();
  return role === 'GERENTE'
    ? all
    : all.filter((item) => !FINANCIAL_ROUTES.some((r) => item.href.startsWith(r)));
}

const SIDEBAR_ICONS: Record<NavIconName, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  users: Users,
  dumbbell: Dumbbell,
  'dollar-sign': DollarSign,
  'file-text': FileText,
  'folder-kanban': FileText,
};

function iconFor(item: NavItemDef): LucideIcon {
  // dev item sidebar uses FlaskConical — separate from BottomNav's union
  if (item.href === '/dashboard/dev') return FlaskConical;
  return SIDEBAR_ICONS[item.iconName];
}

export type DashboardNavItem = NavItemDef;

interface DashboardNavProps {
  role: string;
}

export function DashboardNav({ role }: Readonly<DashboardNavProps>) {
  const pathname = usePathname();

  const navItems = getNavItems(role);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarMenu className="gap-2">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const Icon = iconFor(item);
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
                  <Icon className="h-4 w-4" />
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
        <SidebarMenuButton title="Configurações">
          <Settings />
          <span>Configurações</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <form action={logout} className="w-full">
          <SidebarMenuButton type="submit" title="Sair" className="w-full">
            <LogOut />
            <span>Sair</span>
          </SidebarMenuButton>
        </form>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
