
'use client';

import { usePathname } from 'next/navigation';
import AlunoLayout from './aluno/layout';
import DashboardLayout from './dashboard/layout';

export function AppRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/aluno')) {
    return <AlunoLayout>{children}</AlunoLayout>;
  }

  if (pathname.startsWith('/dashboard') || pathname === '/login') {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Para a página inicial ou outras rotas públicas, renderiza sem layout específico.
  return <>{children}</>;
}
