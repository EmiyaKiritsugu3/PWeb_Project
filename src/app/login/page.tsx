'use client';

import { useState } from 'react';
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
import { createClient } from '@/utils/supabase/client';
import { signInWithGoogle, signInWithGitHub, signInWithApple } from '@/lib/actions/auth';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('E-mail ou senha inválidos. Por favor, tente novamente.');
      setIsPending(false);
      return;
    }

    // Wait for the session cookie to be committed before navigating.
    // Poll getSession() up to 5s — middleware needs the cookie to exist
    // before it can read it. Using setTimeout(500) was brittle.
    for (let attempt = 0; attempt < 10; attempt++) {
      const { data } = await supabase.auth.getSession();
      if (data.session) break;
      await new Promise((r) => setTimeout(r, 500));
    }

    // Hard navigation so middleware reads the fresh session cookie.
    // router.push sends soft RSC that reaches middleware before cookie
    // is available, causing redirect back to /login.
    window.location.href = '/dashboard';
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle('/dashboard');
    if (result.error?.startsWith('http')) {
      window.location.href = result.error;
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleGitHubLogin = async () => {
    const result = await signInWithGitHub('/dashboard');
    if (result.error?.startsWith('http')) {
      window.location.href = result.error;
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleAppleLogin = async () => {
    const result = await signInWithApple('/dashboard');
    if (result.error?.startsWith('http')) {
      window.location.href = result.error;
    } else if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4">
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
          <form onSubmit={handleSubmit} className="grid gap-5">
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

            {error && <p className="text-sm text-destructive">{error}</p>}

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

          {/* Separator above social */}
          <div className="flex w-full items-center gap-4 px-2 pt-4">
            <Separator className="flex-1 opacity-20" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
              OU
            </span>
            <Separator className="flex-1 opacity-20" />
          </div>

          {/* Social login buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2 border-white/10 hover:bg-white/5"
              onClick={handleGoogleLogin}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Entrar com Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2 border-white/10 hover:bg-white/5"
              onClick={handleGitHubLogin}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Entrar com GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2 border-white/10 hover:bg-white/5"
              onClick={handleAppleLogin}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.05 20.28c-.98.95-2.05.80-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.20.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.80 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.40 1.80-3.12 1.87-2.38 5.98.48 7.13-.57 1.50-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.50-3.74 4.25z" />
              </svg>
              Apple
            </Button>
          </div>

          {/* Separator below social */}
          <div className="flex w-full items-center gap-4 px-2">
            <Separator className="flex-1 opacity-20" />
            <Separator className="flex-1 opacity-20" />
          </div>
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
