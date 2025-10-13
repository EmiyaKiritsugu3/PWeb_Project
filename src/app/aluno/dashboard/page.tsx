
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/firebase";
import { ALUNOS, TREINOS } from "@/lib/data"; // Supondo que TREINOS serão exportados de data.ts
import type { Treino, Aluno } from "@/lib/definitions";
import { cn } from "@/lib/utils";

// Componente para o Card de Matrícula
function CardMatricula({ aluno }: { aluno: Aluno | undefined }) {
    if (!aluno) return null;

    const statusConfig = {
        ATIVA: {
            text: "Sua matrícula está ativa.",
            color: "text-green-600",
            bgColor: "bg-green-100",
            borderColor: "border-green-300"
        },
        INADIMPLENTE: {
            text: "Sua matrícula está vencida. Por favor, procure a recepção.",
            color: "text-red-600",
            bgColor: "bg-red-100",
            borderColor: "border-red-300"
        },
        INATIVA: {
            text: "Sua matrícula está inativa.",
            color: "text-gray-600",
            bgColor: "bg-gray-100",
            borderColor: "border-gray-300"
        },
    };

    const config = statusConfig[aluno.statusMatricula];
    const dataVencimento = new Date(); // Simulação
    dataVencimento.setDate(dataVencimento.getDate() + 30);

    return (
        <Card className={cn("w-full", config.borderColor)}>
             <CardHeader className={cn("p-4", config.bgColor)}>
                <CardTitle className="text-lg">Minha Matrícula</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <p className={cn("font-medium", config.color)}>{config.text}</p>
                {aluno.statusMatricula !== 'INATIVA' && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Vencimento em: {dataVencimento.toLocaleDateString('pt-BR')}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// Componente para o Card de Treino
function CardTreino({ treino }: { treino: Treino | undefined }) {
    const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Carrega o estado dos checkboxes do localStorage
        const today = new Date().toISOString().split('T')[0];
        const savedState = localStorage.getItem(`checkedExercises-${today}`);
        if (savedState) {
            setCheckedExercises(JSON.parse(savedState));
        } else {
            // Limpa o localStorage de dias anteriores
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('checkedExercises-')) {
                    localStorage.removeItem(key);
                }
            });
        }
    }, []);

    const handleCheckChange = (exerciseId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const newState = { ...checkedExercises, [exerciseId]: !checkedExercises[exerciseId] };
        setCheckedExercises(newState);
        localStorage.setItem(`checkedExercises-${today}`, JSON.stringify(newState));
    };

    if (!treino) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Meu Treino de Hoje</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Nenhum treino ativo encontrado para você.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Meu Treino de Hoje: {treino.objetivo}</CardTitle>
                <CardDescription>Marque os exercícios conforme for completando.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {treino.exercicios.map((exercicio) => (
                    <div key={exercicio.id} className={cn("rounded-lg border p-4 transition-all", checkedExercises[exercicio.id] && "bg-accent/50")}>
                        <div className="flex items-start gap-4">
                             <Checkbox
                                id={exercicio.id}
                                checked={checkedExercises[exercicio.id] || false}
                                onCheckedChange={() => handleCheckChange(exercicio.id)}
                                className="mt-1 h-5 w-5"
                            />
                            <div className="grid gap-1">
                                <label htmlFor={exercicio.id} className="font-bold text-base cursor-pointer">{exercicio.nomeExercicio}</label>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">{exercicio.series} séries</span> de <span className="font-medium text-foreground">{exercicio.repeticoes} repetições</span>
                                </p>
                                {exercicio.observacoes && (
                                     <p className="text-xs text-muted-foreground italic">
                                        Obs: {exercicio.observacoes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function AlunoDashboardPage() {
    const { user, isUserLoading } = useUser();
    
    // Simulação de busca de dados
    const aluno = ALUNOS.find(a => a.email === user?.email);
    const treinoAtivo = TREINOS.find(t => t.alunoId === aluno?.id && t.ativo);

    return (
       <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Coluna principal com o treino */}
            <div className="col-span-1 grid auto-rows-max items-start gap-6 lg:col-span-2 lg:gap-8">
                <CardTreino treino={treinoAtivo} />
            </div>

            {/* Coluna lateral com status */}
            <div className="col-span-1 grid auto-rows-max items-start gap-6 lg:gap-8">
                <CardMatricula aluno={aluno} />
            </div>
       </div>
    );
}
