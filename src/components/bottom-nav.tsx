'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  DollarSign,
  FileText,
  FolderKanban,
  type LucideIcon,
} from 'lucide-react';

export type NavIconName =
  'layout-dashboard' | 'users' | 'dumbbell' | 'dollar-sign' | 'file-text' | 'folder-kanban';

export type NavItem = {
  href: string;
  label: string;
  iconName: NavIconName;
};

const ICONS: Record<NavIconName, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  users: Users,
  dumbbell: Dumbbell,
  'dollar-sign': DollarSign,
  'file-text': FileText,
  'folder-kanban': FolderKanban,
};

function isActive(href: string, activeHref: string): boolean {
  // ponytail: exact match for root dashboards, startsWith for sub-paths — mirrors dashboard-nav isActive
  if (href === '/dashboard' || href === '/aluno/dashboard') {
    return activeHref === href;
  }
  return activeHref.startsWith(href);
}

export function BottomNav({
  items,
  activeHref,
}: Readonly<{ items: NavItem[]; activeHref: string }>) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 inset-x-0 z-40 h-16 pb-[env(safe-area-inset-bottom)] bg-background/95 backdrop-blur-sm border-t md:hidden"
    >
      <div className="flex h-full items-stretch">
        {items.map((item) => {
          const active = isActive(item.href, activeHref);
          const Icon = ICONS[item.iconName];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-1 touch-target text-muted-foreground transition-colors hover:text-foreground ${
                active ? 'text-primary border-t-2 border-primary' : 'border-t-2 border-transparent'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
