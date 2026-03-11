
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
import { Dumbbell, LogOut, User as UserIcon, LayoutDashboard, FolderKanban } from "lucide-react";
import { useAuth, useUser, FirebaseClientProvider } from "@/firebase";


function AlunoLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== "/aluno/login") {
      router.push("/aluno/login");
    }
  }, [user, isUserLoading, router, pathname]);

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
    router.push("/aluno/login");
  };
  
  const navLinks = [
    { href: '/aluno/dashboard', label: 'Meu Treino de Hoje', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { href: '/aluno/meus-treinos', label: 'Meus Treinos', icon: <FolderKanban className="mr-2 h-4 w-4" /> },
  ]

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
            <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Se o usuário não está logado e está na página de login, apenas renderize a página de login
  if (!user && pathname.endsWith('/login')) {
    return <main>{children}</main>;
  }

  if(user) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <Link href="/" className="flex items-center gap-2">
                <Dumbbell className="h-6 w-6 text-primary" />
                <span className="font-bold">Academia Five Star</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-2 ml-6">
              {navLinks.map(link => (
                <Button key={link.href} variant={pathname === link.href ? "secondary" : "ghost"} asChild>
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </Button>
              ))}
            </nav>

            <div className="flex w-full items-center justify-end gap-4 md:ml-auto">
                <span className="hidden text-sm text-muted-foreground md:inline-block">Olá, {user.displayName || 'Aluno(a)'}!</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar>
                        <AvatarImage src={user.photoURL || "https://picsum.photos/seed/student/100/100"} alt="Aluno" data-ai-hint="person portrait"/>
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                        <p>{user.displayName || 'Aluno(a)'}</p>
                        <p className="text-xs font-normal text-muted-foreground">
                        {user.email}
                        </p>
                    </DropdownMenuLabel>

                    <div className="md:hidden">
                      <DropdownMenuSeparator />
                       {navLinks.map(link => (
                        <DropdownMenuItem key={link.href} asChild>
                           <Link href={link.href}>
                              {link.icon}
                              <span>{link.label}</span>
                           </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
  }
  
  // Se o usuário não está logado e não está na página de login, pode-se mostrar um loader ou redirecionar
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
    </div>
  );
}


export default function AlunoLayout({ children }: { children: React.ReactNode; }) {
    return (
        <FirebaseClientProvider>
            <AlunoLayoutContent>{children}</AlunoLayoutContent>
        </FirebaseClientProvider>
    )
}
