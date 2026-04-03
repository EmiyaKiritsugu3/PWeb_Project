
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardNav, DashboardNavBottom } from "@/components/dashboard-nav";
import { Dumbbell, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

function DashboardAppLayout({ children }: { children: React.ReactNode; }) {
  const { user, isUserLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não está carregando e não há usuário, redireciona para a página de login principal
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };
  
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
            <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.nomeCompleto || 'Administrador';
  const photoURL = user.user_metadata?.avatar_url || user.user_metadata?.fotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
        {/* Animated Background Blobs - Subtle (5% opacity) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-500/5 blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <Sidebar className="z-10 glass-sidebar border-r border-primary/10">
          <SidebarHeader className="border-b border-primary/5 pb-4">
          <Link href="/" className="flex h-12 items-center gap-3 px-4 mt-2">
              <div
              className="size-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center glow-cyan shadow-primary/20"
              >
                <Dumbbell className="text-primary-foreground h-6 w-6" />
              </div>
              <div className="duration-200 group-data-[collapsible=icon]:opacity-0 overflow-hidden">
                <h2 className="font-headline font-black text-xl tracking-tight text-gradient-cyan leading-none">FIVE STAR</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-0.5">Manager Pro</p>
              </div>
          </Link>
          </SidebarHeader>
          <SidebarContent className="px-2 py-4">
          <DashboardNav />
          </SidebarContent>
          <SidebarFooter className="border-t border-primary/5 p-4">
              <DashboardNavBottom />
          </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background/95">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={photoURL} alt="Admin" />
                      <AvatarFallback className="bg-primary/20 text-primary">{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-card mt-2" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="focus:bg-primary/20 focus:text-primary cursor-pointer">Perfil</DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-primary/20 focus:text-primary cursor-pointer">Configurações</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair da conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  return (
    <DashboardAppLayout>{children}</DashboardAppLayout>
  );
}
