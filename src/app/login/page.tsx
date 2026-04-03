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
import { useAuth } from "@/components/providers/auth-provider";
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
  const { user, isUserLoading } = useAuth();
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

  // Se houver um usuário, o useEffect cuidará do redirecionamento.
  // Removendo o bloqueio de renderização 'if (user)' para evitar deadlocks visuais no dev.
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Dumbbell className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground font-medium tracking-widest uppercase text-xs">Sincronizando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-gold/5 blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
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
            <span className="block text-sm font-medium text-muted-foreground mt-1">SISTEMA DE GESTÃO</span>
          </CardTitle>
          <CardDescription className="text-balance pt-2">
            Acesse o painel administrativo da unidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">Email corporativo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="nome@fivestar.com" 
                        {...field} 
                        className="bg-background/50 border-white/5 focus-visible:ring-primary/50 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">Senha de acesso</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="bg-background/50 border-white/5 focus-visible:ring-primary/50 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="group relative w-full overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 transition-all" 
                disabled={isSubmitting}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    'Autenticando...'
                  ) : (
                    <>
                      Entrar no Sistema
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-4 pb-8">
          <div className="flex w-full items-center gap-4 px-2">
            <Separator className="flex-1 opacity-20" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">OU</span>
            <Separator className="flex-1 opacity-20" />
          </div>
          <Button variant="ghost" size="sm" asChild className="w-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
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
