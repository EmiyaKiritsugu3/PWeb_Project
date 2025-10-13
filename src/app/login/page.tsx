
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
import { useAuth, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

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
            description: "Redirecionando para o painel...",
            className: "bg-accent text-accent-foreground"
        });
        router.push('/dashboard');
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            // Se o usuário não existe, tenta criar um novo
            try {
                await createUserWithEmailAndPassword(auth, data.email, data.password);
                toast({
                    title: "Conta de gerente criada!",
                    description: "Redirecionando para o painel...",
                    className: "bg-accent text-accent-foreground"
                });
                router.push('/dashboard');
            } catch (creationError: any) {
                 toast({
                    title: "Erro ao criar conta",
                    description: creationError.message || "Não foi possível criar a conta de gerente.",
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

  // Se o usuário já estiver logado, o useEffect cuidará do redirecionamento.
  // Não há necessidade de exibir uma tela de carregamento aqui.

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <Dumbbell className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
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
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
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
