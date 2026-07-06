'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Dumbbell, LayoutDashboard, FolderKanban } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { I18nProvider, useI18n } from '@/components/providers/i18n-provider';
import { AlunoHeader, type NavLink } from './aluno-header';

function resolveDisplayName(meta: Record<string, unknown> | undefined, fallback: string): string {
  const m = meta as { full_name?: string; nomeCompleto?: string } | undefined;
  return m?.full_name || m?.nomeCompleto || fallback;
}

function resolvePhotoURL(meta: Record<string, unknown> | undefined): string {
  const m = meta as { avatar_url?: string; fotoUrl?: string } | undefined;
  return m?.avatar_url || m?.fotoUrl || 'https://picsum.photos/seed/student/100/100';
}

function LoadingSpinner() {
  const { t } = useI18n();
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
}

function LoginPage({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main>{children}</main>;
}

function FallbackSpinner() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background">
      <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
    </div>
  );
}

function AuthenticatedLayout({
  children,
  pathname,
  displayName,
  photoURL,
  email,
  onLogout,
}: Readonly<{
  children: React.ReactNode;
  pathname: string;
  displayName: string;
  photoURL: string;
  email: string | null | undefined;
  onLogout: () => void;
}>) {
  const { t } = useI18n();
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

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <AlunoHeader
        pathname={pathname}
        navLinks={navLinks}
        displayName={displayName}
        photoURL={photoURL}
        email={email}
        onLogout={onLogout}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}

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

  if (isUserLoading) return <LoadingSpinner />;
  if (!user && pathname.endsWith('/login')) return <LoginPage>{children}</LoginPage>;
  if (!user) return <FallbackSpinner />;

  return (
    <AuthenticatedLayout
      pathname={pathname}
      displayName={resolveDisplayName(user.user_metadata, t('common.student'))}
      photoURL={resolvePhotoURL(user.user_metadata)}
      email={user.email}
      onLogout={handleLogout}
    >
      {children}
    </AuthenticatedLayout>
  );
}

export default function AlunoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <I18nProvider>
      <AlunoLayoutContent>{children}</AlunoLayoutContent>
    </I18nProvider>
  );
}
