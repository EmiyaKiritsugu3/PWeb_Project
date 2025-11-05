
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
import { useAuth, useUser, useFirestore, FirestorePermissionError, errorEmitter } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, UserCredential } from "firebase/auth";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ALUNOS, TREINOS } from "@/lib/data";
import { collection, doc, getDoc, setDoc, writeBatch } from "firebase/firestore";

const formSchema = z.object({
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AlunoLoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
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


  // Função para criar o aluno e seus treinos se não existirem
  const seedAlunoData = async (userCredential: UserCredential) => {
      const user = userCredential.user;
      if (!firestore) return;

      const alunoMock = ALUNOS.find(a => a.email === user.email);
      if (!alunoMock) return; // Não é um aluno de exemplo, não faz nada

      const alunoRef = doc(firestore, "alunos", user.uid);
      const docSnap = await getDoc(alunoRef);

      // Só semeia os dados se o documento do aluno não existir
      if (!docSnap.exists()) {
        const batch = writeBatch(firestore);

        // 1. Cria o documento do aluno
        const alunoData = {
          ...alunoMock,
          id: user.uid, // Garante que o ID do documento é o UID do usuário
        };
        batch.set(alunoRef, alunoData);

        // 2. Adiciona os treinos do aluno na subcoleção
        const treinosMock = TREINOS.filter(t => t.alunoId === alunoMock.id);
        treinosMock.forEach(treino => {
            const treinoRef = doc(collection(firestore, "alunos", user.uid, "treinos"));
            batch.set(treinoRef, { ...treino, id: treinoRef.id, alunoId: user.uid });
        });
        
        // 3. Atualiza o perfil do usuário do Firebase Auth
        await updateProfile(user, {
            displayName: alunoMock.nomeCompleto,
            photoURL: alunoMock.fotoUrl
        });

        // 4. Commita o batch com tratamento de erro contextual
        batch.commit()
          .then(() => {
            toast({ title: "Dados de exemplo criados!", description: "Seu perfil e treinos de exemplo foram carregados." });
          })
          .catch(async (serverError) => {
            console.error("Erro ao semear dados:", serverError);
            const permissionError = new FirestorePermissionError({
              path: `batch write to /alunos/${user.uid}`,
              operation: 'write',
              requestResourceData: { aluno: alunoData, treinos: treinosMock },
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ title: "Erro ao carregar dados de exemplo", variant: "destructive" });
        });
      }
  };


  const handleFormSubmit = async (data: FormValues) => {
    if (!auth) {
        toast({ title: "Erro de configuração", variant: "destructive" });
        return;
    }
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        await seedAlunoData(userCredential); // Garante que os dados de exemplo existam
        toast({
            title: "Login bem-sucedido!",
            className: "bg-accent text-accent-foreground"
        });
        router.push('/aluno/dashboard');
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
             try {
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                await seedAlunoData(userCredential); // Semeia os dados na criação da conta
                toast({
                    title: "Conta criada com sucesso!",
                    className: "bg-accent text-accent-foreground"
                });
                router.push('/aluno/dashboard');
            } catch (creationError: any) {
                 toast({
                    title: "Erro ao criar conta",
                    description: creationError.message,
                    variant: "destructive"
                })
            }
        } else {
            toast({
                title: "Erro de autenticação",
                description: "Senha inválida ou outro erro.",
                variant: "destructive"
            })
        }
    }
  };

  if (!isUserLoading && user) {
    return null; 
  }


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

    
