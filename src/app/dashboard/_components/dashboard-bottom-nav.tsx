'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';
import { DEV_HREF, getNavItems } from '@/components/dashboard-nav';

export function DashboardBottomNav({ role }: Readonly<{ role: string }>) {
  const pathname = usePathname();
  // dev item stays sidebar Sheet-only (secondary nav) — exclude from bottom bar
  const items = getNavItems(role).filter((item) => item.href !== DEV_HREF);
  return <BottomNav items={items} activeHref={pathname} />;
}
