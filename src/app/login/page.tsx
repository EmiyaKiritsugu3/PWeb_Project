"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { useUser } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";

const formSchema = z.object({
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "gerente@fivestar.com",
      password: "123456",
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
          // Simplificação: se não encontrar, tenta criar (mesmo comportamento do mock anterior)
          if (error.message.includes("Invalid login credentials")) {
              const { error: signUpError } = await supabase.auth.signUp({
                  email: data.email,
                  password: data.password,
                  options: {
                      data: {
                          role: 'GERENTE',
                          full_name: 'Gerente Administrador'
                      }
                  }
              });

              if (signUpError) throw signUpError;

              toast({
                  title: "Conta administrativa criada no Supabase!",
                  className: "bg-accent text-accent-foreground"
              });
              router.push('/dashboard');
              return;
          }
          throw error;
      }

      toast({
          title: "Login bem-sucedido!",
          description: "Redirecionando para o painel...",
          className: "bg-accent text-accent-foreground"
      });
      router.push('/dashboard');
    } catch (error: any) {
        toast({
            title: "Erro de autenticação",
            description: error.message || "Ocorreu um erro inesperado.",
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm glass-card">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <Dumbbell className="h-10 w-10 text-primary" />
                </div>
                <div className="text-2xl font-semibold leading-none tracking-tight text-center">
                    <h1 className="text-2xl font-bold">Gestão Five Star</h1>
                </div>
                <CardDescription>
                    Faça login para gerenciar a academia.
                </CardDescription>
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
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
                </Form>
            </CardContent>
             <CardFooter className="flex-col gap-4">
                <Separator />
                <Button variant="link" size="sm" asChild className="w-full text-muted-foreground">
                    <Link href="/aluno/login">Acessar Portal do Aluno</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
