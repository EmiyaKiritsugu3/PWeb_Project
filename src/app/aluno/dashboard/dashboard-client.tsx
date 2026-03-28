"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, Info, CalendarOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateWorkoutFeedback } from "@/ai/flows/workout-feedback-flow";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Treino, Aluno, Exercicio } from "@/lib/definitions";
import { finalizarTreinoAction } from "@/lib/actions/alunos";
import { useToast } from "@/hooks/use-toast";

// Componente para o Modal de Visualização do Exercício
function ExercicioViewer({ exercicio, isOpen, onOpenChange }: { exercicio: Exercicio | null; isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    if (!exercicio) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>{exercicio.nomeExercicio}</AlertDialogTitle>
                </AlertDialogHeader>
                <ScrollArea className="max-h-80 w-full rounded-md pr-4">
                    <div className="grid gap-4 py-4 text-sm text-muted-foreground whitespace-pre-wrap">
                        {exercicio.descricao || "Nenhuma descrição disponível para este exercício."}
                    </div>
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogCancel>Fechar</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Componente para o Card de Matrícula
function CardMatricula({ aluno }: { aluno: Aluno | null }) {
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

    const config = statusConfig[aluno.statusMatricula] || statusConfig.INATIVA;
    
    // Simplificar exibição de vencimento para exemplo
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 15);

    return (
        <Card className={cn("w-full", config.borderColor)}>
             <CardHeader className={cn("p-4", config.bgColor)}>
                <CardTitle className="text-lg">Minha Matrícula</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <p className={cn("font-medium", config.color)}>{config.text}</p>
                {aluno.statusMatricula !== 'INATIVA' && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Vencimento estimado: {dataVencimento.toLocaleDateString('pt-BR')}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// Componente para o Card de Treino
function CardTreino({ 
    treino, 
    onFinishTraining, 
    isFeedbackLoading,
    onViewExercicio
}: { 
    treino: Treino | null;
    onFinishTraining: (completedExercises: string[]) => void;
    isFeedbackLoading: boolean;
    onViewExercicio: (exercicio: Exercicio) => void;
}) {
    const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!treino) return;
        const storageKey = `checkedExercises-${new Date().toISOString().split('T')[0]}-${treino?.id}`;
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
            setCheckedExercises(JSON.parse(savedState));
        }
    }, [treino]);

    const handleCheckChange = (exerciseId: string) => {
        if (!treino) return;
        const storageKey = `checkedExercises-${new Date().toISOString().split('T')[0]}-${treino?.id}`;
        const newState = { ...checkedExercises, [exerciseId]: !checkedExercises[exerciseId] };
        setCheckedExercises(newState);
        localStorage.setItem(storageKey, JSON.stringify(newState));
    };
    
    const handleFinishClick = () => {
        const completed = Object.keys(checkedExercises).filter(id => checkedExercises[id]);
        onFinishTraining(completed);
    }

    if (!treino) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Treino de Hoje</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-10 gap-4">
                    <CalendarOff className="h-16 w-16 text-muted-foreground" />
                    <p className="font-medium">Dia de descanso!</p>
                    <p className="text-muted-foreground">Aproveite para se recuperar. Nenhum treino agendado para hoje.</p>
                </CardContent>
            </Card>
        );
    }

    const allExercises = treino.exercicios || [];
    const completedCount = Object.values(checkedExercises).filter(Boolean).length;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Meu Treino de Hoje: {treino.objetivo}</CardTitle>
                <CardDescription>Marque os exercícios conforme for completando.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {allExercises.map((exercicio) => (
                    <div key={exercicio.id} className={cn("rounded-lg border p-4 transition-all", checkedExercises[exercicio.id] && "bg-accent/50")}>
                        <div className="flex items-center gap-4">
                             <Checkbox
                                id={exercicio.id}
                                checked={checkedExercises[exercicio.id] || false}
                                onCheckedChange={() => handleCheckChange(exercicio.id)}
                                className="h-5 w-5"
                            />
                            <div className="grid flex-1 gap-1">
                                <label htmlFor={exercicio.id} className="font-bold text-base cursor-pointer">{exercicio.nomeExercicio}</label>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">{exercicio.series} séries</span> de <span className="font-medium text-foreground">{exercicio.repeticoes} repetições</span>
                                </p>
                            </div>
                             {exercicio.descricao && (
                                <Button variant="ghost" size="icon" onClick={() => onViewExercicio(exercicio)}>
                                    <Info className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                <p className="text-sm text-muted-foreground">
                    {completedCount} de {allExercises.length} exercícios completados.
                </p>
                <Button onClick={handleFinishClick} disabled={completedCount === 0 || isFeedbackLoading} className="w-full md:w-auto">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isFeedbackLoading ? 'Analisando seu treino...' : 'Finalizar Treino e Receber Feedback'}
                </Button>
            </CardFooter>
        </Card>
    );
}

// Componente para o feedback da IA
function CardFeedback({ feedback, isLoading }: { feedback: { title: string; message: string; } | null, isLoading: boolean }) {
    if (isLoading) {
        return (
             <Card className="bg-secondary border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <BrainCircuit className="h-6 w-6 animate-pulse" />
                        Analisando seu desempenho...
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!feedback) return null;

    return (
        <Card className="bg-accent/10 border-accent animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                    <Sparkles className="h-6 w-6 text-accent" />
                    {feedback.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-accent-foreground text-sm leading-relaxed">{feedback.message}</p>
            </CardContent>
        </Card>
    )
}

interface AlunoDashboardClientProps {
    initialAluno: Aluno;
    initialTreino: Treino | null;
}

export default function AlunoDashboardClient({ initialAluno, initialTreino }: AlunoDashboardClientProps) {
    const { toast } = useToast();
    const [aluno, setAluno] = useState<Aluno>(initialAluno);
    const [feedback, setFeedback] = useState<{ title: string; message: string; } | null>(null);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedExercicio, setSelectedExercicio] = useState<Exercicio | null>(null);

    const handleViewExercicio = (exercicio: Exercicio) => {
        setSelectedExercicio(exercicio);
        setIsViewerOpen(true);
    };

    const handleFinishTraining = async (completedExercises: string[]) => {
        if (!initialTreino) return;

        setIsFeedbackLoading(true);
        setFeedback(null);

        try {
            // 1. Gerar Feedback de IA (Client-side call for speed/stream potential)
            const exerciseNames = completedExercises
                .map(id => initialTreino.exercicios?.find(ex => ex.id === id)?.nomeExercicio)
                .filter((name): name is string => !!name);

            const aiResult = await generateWorkoutFeedback({
                goal: initialTreino.objetivo,
                completedExercises: exerciseNames,
                totalExercises: initialTreino.exercicios?.length || 0,
            });

            setFeedback(aiResult);

            // 2. Persistir no PostgreSQL e atualizar Gamificação (Server Action)
            const result = await finalizarTreinoAction(initialTreino.id);
            
            if (result.success) {
                toast({ title: "Treino registrado! XP ganhos.", className: "bg-accent text-accent-foreground" });
                // Em um cenário real, você buscaria o aluno atualizado ou usaria revalidatePath
                // Para feedback visual imediato, simulamos o incremento (ou o pai recarrega)
            } else {
                toast({ title: "Erro ao salvar progresso.", variant: "destructive" });
            }

        } catch (error) {
            console.error("Error:", error);
            setFeedback({
                title: "Feedback Indisponível",
                message: "Seu treino foi registrado, mas não conseguimos gerar o feedback da IA no momento."
            });
        } finally {
            setIsFeedbackLoading(false);
        }
    };

    const xpToNextLevel = aluno.xpToNextLevel ?? (aluno.nivel * 1500);
    const progressPerc = aluno.progressPerc ?? Math.min(Math.round((aluno.exp / xpToNextLevel) * 100), 100);

    return (
       <>
            <ExercicioViewer 
                exercicio={selectedExercicio}
                isOpen={isViewerOpen}
                onOpenChange={setIsViewerOpen}
            />
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="col-span-1 grid auto-rows-max items-start gap-6 lg:col-span-2 lg:gap-8">
                        <CardTreino 
                            treino={initialTreino} 
                            onFinishTraining={handleFinishTraining}
                            isFeedbackLoading={isFeedbackLoading}
                            onViewExercicio={handleViewExercicio}
                        />
                    </div>

                    <div className="col-span-1 grid auto-rows-max items-start gap-6 lg:gap-8">
                        {/* Gamification Card */}
                        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Seu Progresso
                                </CardTitle>
                                <CardDescription>Continue firme no seu objetivo!</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold">Nível {aluno.nivel}</span>
                                        <span className="text-muted-foreground">{aluno.exp} / {xpToNextLevel} XP</span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                                        <div 
                                            className="h-full bg-primary transition-all duration-1000" 
                                            style={{ width: `${progressPerc}%` }} 
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-around pt-2">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-primary">{aluno.treinosNoMes}</div>
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">No Mês</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-orange-500">{aluno.streakDiasSeguidos}🔥</div>
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sequência</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <CardMatricula aluno={aluno} />
                        <CardFeedback feedback={feedback} isLoading={isFeedbackLoading} />
                    </div>
            </div>
       </>
    );
}
