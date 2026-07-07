'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAppNotification } from '@/hooks/use-app-notification';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/utils/supabase/client';
import { signInWithGoogle, signInWithGitHub, signInWithMagicLink } from '@/lib/actions/auth';

const formSchema = z.object({
  email: z.string().email('Por favor, insira um email válido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AlunoLoginPage() {
  const notify = useAppNotification();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Se não encontrar o usuário, tentamos criar (mesmo comportamento do mock anterior)
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                role: 'ALUNO',
              },
            },
          });

          if (signUpError) throw signUpError;

          notify.success('Conta criada no Supabase!', 'Agora você pode acessar o sistema.');
          router.push('/aluno/dashboard');
          return;
        }
        throw error;
      }

      notify.success('Login bem-sucedido!');
      router.push('/aluno/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const result = await signInWithGoogle('/aluno/dashboard');
    if (result.error?.startsWith('http')) {
      window.location.href = result.error;
    } else if (result.error) {
      setAuthError(result.error);
    }
  };

  const handleGitHubSignIn = async () => {
    setAuthError(null);
    const result = await signInWithGitHub('/aluno/dashboard');
    if (result.error?.startsWith('http')) {
      window.location.href = result.error;
    } else if (result.error) {
      setAuthError(result.error);
    }
  };

  const handleMagicLinkSubmit = async () => {
    if (!magicLinkEmail) return;
    setMagicLinkLoading(true);
    setMagicLinkError(null);
    setMagicLinkSent(false);

    const formData = new FormData();
    formData.append('email', magicLinkEmail);

    const result = await signInWithMagicLink(formData);

    if (result.error) {
      setMagicLinkError(result.error);
    } else {
      setMagicLinkSent(true);
    }
    setMagicLinkLoading(false);
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
              PORTAL DO ALUNO
            </span>
          </CardTitle>
          <CardDescription className="text-balance pt-2">
            Acesse seu treino e informações usando sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 grid gap-5">
          {authError && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {authError}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/10 bg-background/50 hover:bg-background/80 hover:text-foreground transition-all"
              onClick={handleGoogleSignIn}
            >
              <svg
                className="mr-2 h-4 w-4"
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
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/10 bg-background/50 hover:bg-background/80 hover:text-foreground transition-all"
              onClick={handleGitHubSignIn}
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>

          {/* Separator */}
          <div className="flex w-full items-center gap-4">
            <Separator className="flex-1 opacity-20" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
              OU
            </span>
            <Separator className="flex-1 opacity-20" />
          </div>

          {/* Magic Link Section */}
          <div className="grid gap-3">
            <Input
              placeholder="seu@email.com"
              type="email"
              value={magicLinkEmail}
              onChange={(e) => {
                setMagicLinkEmail(e.target.value);
                setMagicLinkSent(false);
                setMagicLinkError(null);
              }}
              className="bg-background/50 border-white/5 focus-visible:ring-primary/50 transition-all"
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full transition-all"
              disabled={magicLinkLoading || !magicLinkEmail}
              onClick={handleMagicLinkSubmit}
            >
              {magicLinkLoading ? 'Enviando...' : 'Enviar link mágico'}
            </Button>
            {magicLinkSent && (
              <p className="text-center text-sm text-green-400">
                Email enviado! Verifique sua caixa de entrada.
              </p>
            )}
            {magicLinkError && <p className="text-center text-sm text-red-400">{magicLinkError}</p>}
          </div>

          {/* Separator */}
          <div className="flex w-full items-center gap-4">
            <Separator className="flex-1 opacity-20" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
              OU
            </span>
            <Separator className="flex-1 opacity-20" />
          </div>

          {/* Email/Password Login */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="none"
                        className="bg-background/50 border-white/5 focus-visible:ring-primary/50 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
                      Senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="bg-background/50 border-white/5 focus-visible:ring-primary/50 transition-all pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="group relative w-full overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </form>
          </Form>
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
            <Link href="/login" className="flex items-center gap-2">
              Acesso para Gestão
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
