
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
import { useAuth, useUser, useFirestore, FirestorePermissionError, errorEmitter, FirebaseClientProvider } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

function LoginPageContent() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
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
    // Se o usuário já está logado, redireciona para o dashboard
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  // Função para criar/atualizar o documento do funcionário
  const upsertFuncionarioDocument = (userCredential: UserCredential) => {
    const user = userCredential.user;
    if (!firestore) return;
    const funcionarioRef = doc(firestore, "funcionarios", user.uid);
    const funcionarioData = {
      id: user.uid,
      nomeCompleto: user.displayName || 'Gerente',
      email: user.email,
      role: 'GERENTE'
    };
    
    // Non-blocking write with contextual error handling
    setDoc(funcionarioRef, funcionarioData, { merge: true })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: funcionarioRef.path,
            operation: 'write',
            requestResourceData: funcionarioData,
          });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

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
        // Tenta fazer o login primeiro
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        upsertFuncionarioDocument(userCredential); 
        toast({
            title: "Login bem-sucedido!",
            description: "Redirecionando para o painel...",
            className: "bg-accent text-accent-foreground"
        });
        router.push('/dashboard');
    } catch (error: any) {
        // Se o usuário não existe, cria a conta
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                upsertFuncionarioDocument(userCredential);
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
                });
            }
        } else {
             toast({
                title: "Erro de autenticação",
                description: error.message || "Ocorreu um erro inesperado.",
                variant: "destructive"
            });
        }
    }
  };

  // Se estiver carregando ou se o usuário já estiver logado, mostra um loader
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

  // Apenas renderiza o formulário se o usuário não estiver logado e o carregamento estiver completo
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

export default function LoginPage() {
    return (
        <FirebaseClientProvider>
            <LoginPageContent />
        </FirebaseClientProvider>
    )
}
