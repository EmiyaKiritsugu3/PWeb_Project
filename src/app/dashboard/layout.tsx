
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
import { useAuth, useUser } from "@/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push("/login");
    }
  }, [user, isUserLoading, router, pathname]);

  const handleLogout = () => {
    auth?.signOut();
    router.push("/login");
  };
  
  if (isUserLoading || (!user && pathname !== '/login')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
            <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!user && pathname === '/login') {
    return <main>{children}</main>;
  }

  if (user) {
    return (
        <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
            <Link href="/" className="flex h-10 items-center gap-2.5 px-2">
                <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 rounded-full"
                asChild
                >
                <Dumbbell className="text-primary" />
                </Button>
                <div className="duration-200 group-data-[collapsible=icon]:-translate-x-2 group-data-[collapsible=icon]:opacity-0">
                <h2 className="font-headline font-bold">Five Star</h2>
                <p className="text-xs text-muted-foreground">Painel de Gestão</p>
                </div>
            </Link>
            </SidebarHeader>
            <SidebarContent>
            <DashboardNav />
            </SidebarContent>
            <SidebarFooter>
                <DashboardNavBottom />
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar>
                    <AvatarImage src={user.photoURL || "https://picsum.photos/seed/admin/100/100"} alt="Admin" data-ai-hint="person portrait"/>
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                    <p>{user.displayName || 'Admin User'}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                    {user.email}
                    </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
        </SidebarProvider>
    );
  }

  return <main>{children}</main>;
}
