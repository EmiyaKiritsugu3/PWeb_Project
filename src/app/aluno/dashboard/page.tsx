import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import AlunoDashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarOff } from "lucide-react";

export default async function AlunoDashboardPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/aluno/login");
    }

    // 1. Buscar Aluno no PostgreSQL usando o email do Supabase Auth
    const aluno = await prisma.aluno.findUnique({
        where: { email: user.email },
        select: {
            id: true,
            nomeCompleto: true,
            fotoUrl: true,
            nivel: true,
            exp: true,
            streakDiasSeguidos: true,
            treinosNoMes: true,
            ultimoTreinoData: true,
            xpToNextLevel: true,
            progressPerc: true,
            Matriculas: {
                where: { status: 'ATIVA' },
                take: 1,
                select: { id: true, status: true, dataVencimento: true, planoId: true }
            }
        }
    });

    if (!aluno) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Sinto muito!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p>Seu perfil de aluno não foi encontrado no novo sistema.</p>
                        <p className="text-sm text-muted-foreground">Por favor, procure o administrador da academia para vincular seu email ({user.email}).</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 2. Buscar Treino do Dia
    const today = new Date().getDay(); // 0-6 (Dom-Sab)
    
    const treinoDoDia = await prisma.treino.findFirst({
        where: {
            alunoId: aluno.id,
            diaSemana: today,
        },
        select: {
            id: true,
            objetivo: true,
            diaSemana: true,
            Exercicios: {
                select: {
                    id: true,
                    nomeExercicio: true,
                    series: true,
                    repeticoes: true,
                    observacoes: true,
                    descricao: true,
                }
            }
        }
    });

    // 3. Renderizar Client Component
    return (
        <AlunoDashboardClient 
            initialAluno={aluno as any} 
            initialTreino={treinoDoDia as any} 
        />
    );
}
