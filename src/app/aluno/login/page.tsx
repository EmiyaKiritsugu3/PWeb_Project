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
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-5">
              {authError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {authError}
                </div>
              )}
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
