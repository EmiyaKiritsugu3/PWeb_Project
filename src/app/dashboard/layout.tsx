import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { DashboardNav, DashboardNavBottom } from '@/components/dashboard-nav';
import { DashboardBottomNav } from '@/app/dashboard/_components/dashboard-bottom-nav';
import { UserMenu } from '@/app/dashboard/_components/user-menu';
import { createClient } from '@/utils/supabase/server';
import { Dumbbell } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

function resolveDisplayName(user: User) {
  return user.user_metadata?.full_name || user.user_metadata?.nomeCompleto || 'Administrador';
}

function resolvePhotoURL(user: User) {
  return (
    user.user_metadata?.avatar_url ||
    user.user_metadata?.fotoUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
  );
}

function DashboardSidebar({ role }: Readonly<{ role: string }>) {
  return (
    <Sidebar className="z-10 glass-sidebar border-r border-primary/10">
      <SidebarHeader className="border-b border-primary/5 pb-4">
        <Link href="/" className="flex h-12 items-center gap-3 px-4 mt-2">
          <div className="size-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center glow-cyan shadow-primary/20">
            <Dumbbell className="text-primary-foreground h-6 w-6" />
          </div>
          <div className="duration-200 group-data-[collapsible=icon]:opacity-0 overflow-hidden">
            <h2 className="font-headline font-black text-xl tracking-tight text-gradient-cyan leading-none">
              FIVE STAR
            </h2>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-0.5">
              Manager Pro
            </p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <DashboardNav role={role} />
      </SidebarContent>
      <SidebarFooter className="border-t border-primary/5 p-4">
        <DashboardNavBottom />
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardHeader({
  displayName,
  email,
  photoURL,
}: Readonly<{
  displayName: string;
  email: string;
  photoURL: string;
}>) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-background/40 px-6 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-primary" />
        <div className="hidden md:flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">Bem-vindo de volta,</span>
          <span className="text-sm font-bold text-foreground">{displayName}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>
        <UserMenu displayName={displayName} email={email} photoURL={photoURL} />
      </div>
    </header>
  );
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: funcionarioPerfil } = await supabase
    .from('funcionarios')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = funcionarioPerfil?.role ?? 'RECEPCIONISTA';
  const displayName = resolveDisplayName(user);
  const photoURL = resolvePhotoURL(user);

  return (
    <SidebarProvider>
      <div className="relative flex min-h-dvh w-full overflow-hidden bg-background">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px] animate-glow-pulse" />
          <div
            className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-500/5 blur-[120px] animate-glow-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <DashboardSidebar role={role} />

        <SidebarInset className="bg-background/95">
          <DashboardHeader displayName={displayName} email={user.email!} photoURL={photoURL} />
          <div className="flex-1 p-6 pb-20 md:p-8 md:pb-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </SidebarInset>
        {/* ponytail: nav outside <main> (SidebarInset renders <main>) — avoids nesting nav landmark inside main, matches aluno layout */}
        <DashboardBottomNav role={role} />
      </div>
    </SidebarProvider>
  );
}
