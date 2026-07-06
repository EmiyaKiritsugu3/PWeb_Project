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
import { Dumbbell } from 'lucide-react';
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
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'ana.silva@example.com',
      password: '123456',
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setIsLoading(true);
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      notify.error('Erro de autenticação', errorMessage, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Dumbbell className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Portal do Aluno (Supabase)</CardTitle>
          <CardDescription>Acesse seu treino e informações usando sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Separator />
          <Button variant="link" size="sm" asChild className="w-full text-muted-foreground">
            <Link href="/login">Acesso para Gestão</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
