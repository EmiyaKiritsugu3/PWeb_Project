
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AlunoLoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "ana.silva@example.com",
      password: "123456",
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/aluno/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleFormSubmit = async (data: FormValues) => {
    if (!auth) {
        toast({
            title: "Erro de configuração",
            description: "O serviço de autenticação não está disponível.",
            variant: "destructive"
        });
        return;
    }
    
    try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
            title: "Login bem-sucedido!",
            description: "Bem-vindo(a) de volta!",
            className: "bg-accent text-accent-foreground"
        });
        router.push('/aluno/dashboard');
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            // Se o usuário não existe, tenta criar um novo
             try {
                await createUserWithEmailAndPassword(auth, data.email, data.password);
                toast({
                    title: "Conta criada com sucesso!",
                    description: "Bem-vindo(a)! Redirecionando para o painel...",
                    className: "bg-accent text-accent-foreground"
                });
                router.push('/aluno/dashboard');
            } catch (creationError: any) {
                 toast({
                    title: "Erro ao criar conta",
                    description: creationError.message || "Não foi possível criar sua conta.",
                    variant: "destructive"
                })
            }
        } else {
            let description = "Ocorreu um erro ao tentar fazer login.";
            if (error.code === 'auth/wrong-password') {
                description = "Senha inválida. Por favor, tente novamente.";
            }
            toast({
                title: "Erro de autenticação",
                description,
                variant: "destructive"
            })
        }
    }
  };

  // Não exibe a tela de carregamento aqui, renderiza o formulário diretamente
  // O useEffect vai cuidar do redirecionamento se o usuário já estiver logado.

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <Dumbbell className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Portal do Aluno</CardTitle>
                <CardDescription>
                    Acesse seu treino e informações.
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
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
