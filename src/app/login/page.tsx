'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(login, undefined);

  // Handle client-side redirect on successful login
  useEffect(() => {
    if (state && 'success' in state && state.success) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px] animate-glow-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-gold/5 blur-[120px] animate-glow-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <Card className="z-10 w-full max-w-sm glass-card glow-cyan border-white/10">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <Dumbbell className="relative h-12 w-12 text-primary animate-float" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-cyan">Five Star</span>
            <span className="block text-sm font-medium text-muted-foreground mt-1">
              SISTEMA DE GESTÃO
            </span>
          </CardTitle>
          <CardDescription className="text-balance pt-2">
            Acesse o painel administrativo da unidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={action} className="grid gap-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs uppercase tracking-wider text-muted-foreground/70"
              >
                Email corporativo
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nome@fivestar.com"
                required
                className="bg-background/50 border-white/5 focus-visible:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-wider text-muted-foreground/70"
              >
                Senha de acesso
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-background/50 border-white/5 focus-visible:ring-primary/50 transition-all"
              />
            </div>

            {state && 'error' in state && <p className="text-sm text-destructive">{state.error}</p>}

            <Button
              type="submit"
              className="group relative w-full overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              disabled={isPending}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? 'Autenticando...' : <>Entrar no Sistema</>}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4 pb-8">
          <div className="flex w-full items-center gap-4 px-2">
            <Separator className="flex-1 opacity-20" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
              OU
            </span>
            <Separator className="flex-1 opacity-20" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Link href="/aluno/login" className="flex items-center gap-2">
              Acessar Portal do Aluno
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground/30 font-light tracking-widest uppercase">
        &copy; 2026 Five Star Fitness &bull; v4.0.0-oxide
      </p>
    </div>
  );
}
