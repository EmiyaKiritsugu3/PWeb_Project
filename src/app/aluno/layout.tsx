'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Dumbbell, LayoutDashboard, FolderKanban } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { I18nProvider, useI18n } from '@/components/providers/i18n-provider';
import { AlunoHeader, type NavLink } from './aluno-header';

function AlunoLayoutContent({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, isUserLoading, signOut } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/aluno/login') {
      router.push('/aluno/login');
    }
  }, [user, isUserLoading, router, pathname]);

  const handleLogout = async () => {
    await signOut();
    router.push('/aluno/login');
  };

  const navLinks: NavLink[] = [
    {
      href: '/aluno/dashboard',
      label: t('common.todayWorkout'),
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      href: '/aluno/meus-treinos',
      label: t('common.myWorkouts'),
      icon: <FolderKanban className="mr-2 h-4 w-4" />,
    },
  ];

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user && pathname.endsWith('/login')) {
    return <main>{children}</main>;
  }

  if (user) {
    const displayName =
      user.user_metadata?.full_name || user.user_metadata?.nomeCompleto || t('common.student');
    const photoURL =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.fotoUrl ||
      'https://picsum.photos/seed/student/100/100';

    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <AlunoHeader
          pathname={pathname}
          navLinks={navLinks}
          displayName={displayName}
          photoURL={photoURL}
          email={user.email}
          onLogout={handleLogout}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
    </div>
  );
}

export default function AlunoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <I18nProvider>
      <AlunoLayoutContent>{children}</AlunoLayoutContent>
    </I18nProvider>
  );
}
