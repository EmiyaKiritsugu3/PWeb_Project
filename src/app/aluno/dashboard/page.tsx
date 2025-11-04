
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/firebase";
import { ALUNOS, TREINOS } from "@/lib/data";
import type { Treino, Aluno, Exercicio } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateWorkoutFeedback } from "@/ai/flows/workout-feedback-flow";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";


// Componente para o Modal de Visualização do Exercício
function ExercicioViewer({ exercicio, isOpen, onOpenChange }: { exercicio: Exercicio | null; isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    if (!exercicio) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{exercicio.nomeExercicio}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Visualize a execução correta do exercício.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-center items-center p-4">
                    {exercicio.gifUrl ? (
                         <Image
                            src={exercicio.gifUrl}
                            alt={`Demonstração do exercício ${exercicio.nomeExercicio}`}
                            width={400}
                            height={400}
                            unoptimized // GIFs não são otimizados pelo Next/Image por padrão
                            className="rounded-lg"
                        />
                    ) : (
                        <p className="text-muted-foreground">Nenhuma visualização disponível.</p>
                    )}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Fechar</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

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
function CardTreino({ 
    treino, 
    onFinishTraining, 
    isFeedbackLoading,
    onViewExercicio
}: { 
    treino: Treino | undefined;
    onFinishTraining: (completedExercises: string[]) => void;
    isFeedbackLoading: boolean;
    onViewExercicio: (exercicio: Exercicio) => void;
}) {
    const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const savedState = localStorage.getItem(`checkedExercises-${today}`);
        if (savedState) {
            setCheckedExercises(JSON.parse(savedState));
        } else {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('checkedExercises-')) {
                    localStorage.removeItem(key);
                }
            });
             // Ao carregar um novo treino, limpa os checkboxes
            setCheckedExercises({});
        }
    }, [treino]); // Roda o efeito quando o treino muda

    const handleCheckChange = (exerciseId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const newState = { ...checkedExercises, [exerciseId]: !checkedExercises[exerciseId] };
        setCheckedExercises(newState);
        localStorage.setItem(`checkedExercises-${today}`, JSON.stringify(newState));
    };
    
    const handleFinishClick = () => {
        const completed = Object.keys(checkedExercises).filter(id => checkedExercises[id]);
        onFinishTraining(completed);
    }

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

    const allExercises = treino.exercicios;
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
                                className="mt-1 h-5 w-5"
                            />
                            <div className="grid flex-1 gap-1">
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
                             {exercicio.gifUrl && (
                                <Button variant="ghost" size="icon" onClick={() => onViewExercicio(exercicio)}>
                                    <PlayCircle className="h-6 w-6 text-muted-foreground" />
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
                <Button onClick={handleFinishClick} disabled={completedCount === 0 || isFeedbackLoading}>
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
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
        )
    }

    if (!feedback) return null;

    return (
        <Card className="bg-accent/10 border-accent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                    <Sparkles className="h-6 w-6 text-accent" />
                    {feedback.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-accent">{feedback.message}</p>
            </CardContent>
        </Card>
    )
}

export default function AlunoDashboardPage() {
    const { user } = useUser();
    
    // Simulação de busca de dados
    const aluno = ALUNOS.find(a => a.email === user?.email);
    const treinoAtivo = TREINOS.find(t => t.alunoId === aluno?.id && t.ativo);

    const [feedback, setFeedback] = useState<{ title: string; message: string; } | null>(null);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedExercicio, setSelectedExercicio] = useState<Exercicio | null>(null);


    const handleViewExercicio = (exercicio: Exercicio) => {
        setSelectedExercicio(exercicio);
        setIsViewerOpen(true);
    };


    const handleFinishTraining = async (completedExercises: string[]) => {
        if (!treinoAtivo) return;

        setIsFeedbackLoading(true);
        setFeedback(null); // Limpa feedback anterior

        try {
            const exerciseNames = completedExercises
                .map(id => treinoAtivo.exercicios.find(ex => ex.id === id)?.nomeExercicio)
                .filter((name): name is string => !!name);

            const result = await generateWorkoutFeedback({
                goal: treinoAtivo.objetivo,
                completedExercises: exerciseNames,
                totalExercises: treinoAtivo.exercicios.length,
            });

            setFeedback(result);

        } catch (error) {
            console.error("Error generating feedback:", error);
            setFeedback({
                title: "Ocorreu um erro",
                message: "Não foi possível gerar seu feedback no momento. Tente novamente mais tarde."
            });
        } finally {
            setIsFeedbackLoading(false);
        }
    };


    return (
       <>
            <ExercicioViewer 
                exercicio={selectedExercicio}
                isOpen={isViewerOpen}
                onOpenChange={setIsViewerOpen}
            />
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
                    {/* Coluna principal com o treino */}
                    <div className="col-span-1 grid auto-rows-max items-start gap-6 lg:col-span-2 lg:gap-8">
                        <CardTreino 
                            treino={treinoAtivo} 
                            onFinishTraining={handleFinishTraining}
                            isFeedbackLoading={isFeedbackLoading}
                            onViewExercicio={handleViewExercicio}
                        />
                    </div>

                    {/* Coluna lateral com status e feedback */}
                    <div className="col-span-1 grid auto-rows-max items-start gap-6 lg:gap-8">
                        <CardMatricula aluno={aluno} />
                        <CardFeedback feedback={feedback} isLoading={isFeedbackLoading} />
                    </div>
            </div>
       </>
    );
}
