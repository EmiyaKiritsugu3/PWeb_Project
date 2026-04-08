'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { useAuth } from '@/components/providers/auth-provider';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/dashboard/alunos', icon: <Users />, label: 'Alunos' },
  { href: '/dashboard/treinos', icon: <Dumbbell />, label: 'Treinos' },
  { href: '/dashboard/financeiro', icon: <DollarSign />, label: 'Financeiro' },
  { href: '/dashboard/planos', icon: <FileText />, label: 'Planos' },
];

if (process.env.NODE_ENV === 'development') {
  navItems.push({ href: '/dashboard/dev', icon: <FlaskConical />, label: 'Dev' });
}

export function DashboardNav() {
  const pathname = usePathname();

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
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    auth?.signOut();
    router.push('/login');
  };

  const bottomNavItems = [
    { href: '#', icon: <Settings />, label: 'Configurações', action: () => {} },
    { href: '#', icon: <LogOut />, label: 'Sair', action: handleLogout },
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
  );
}
