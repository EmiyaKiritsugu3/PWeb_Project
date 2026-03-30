"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle, 
    CardFooter 
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
    Sparkles, 
    BrainCircuit, 
    Info, 
    CalendarOff, 
    CheckCircle2, 
    AlertCircle, 
    Calendar,
    Trophy, 
    TrendingUp, 
    Zap, 
    Target, 
    Award 
} from "lucide-react";
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
import { CircularProgress } from "@/components/ui/circular-progress";

// Componente para o Modal de Visualização do Exercício
function ExercicioViewer({ exercicio, isOpen, onOpenChange }: { exercicio: Exercicio | null; isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    if (!exercicio) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="glass-card max-w-md border-cyan-500/20">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-gradient-cyan text-2xl">{exercicio.nomeExercicio}</AlertDialogTitle>
                </AlertDialogHeader>
                <ScrollArea className="max-h-80 w-full rounded-md pr-4">
                    <div className="grid gap-4 py-4 text-sm text-foreground/80 leading-relaxed">
                        {exercicio.descricao || "Nenhuma descrição disponível para este exercício."}
                    </div>
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/10">Fechar</AlertDialogCancel>
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
            text: "Matrícula Ativa",
            icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
            glow: "border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
        },
        INADIMPLENTE: {
            text: "Pagamento Pendente",
            icon: <AlertCircle className="h-5 w-5 text-red-400" />,
            glow: "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        },
        INATIVA: {
            text: "Matrícula Inativa",
            icon: <Info className="h-5 w-5 text-gray-400" />,
            glow: "border-gray-500/30"
        },
    };

    const config = statusConfig[aluno.statusMatricula] || statusConfig.INATIVA;
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 15);

    return (
        <Card glass className={cn("overflow-hidden", config.glow)}>
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-white/5 border border-white/10">
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status do Plano</p>
                        <h3 className="text-xl font-bold headline flex items-center gap-2">
                           {config.text}
                        </h3>
                    </div>
                </div>
                <div className="text-right">
                   <p className="text-xs text-muted-foreground uppercase">Vencimento</p>
                   <p className="font-bold text-white/90">{dataVencimento.toLocaleDateString('pt-BR')}</p>
                </div>
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
             <Card glass className="border-dashed border-white/10">
                <CardContent className="flex flex-col items-center justify-center text-center py-16 gap-6">
                    <div className="p-6 rounded-full bg-white/5 border border-white/5 animate-float">
                        <CalendarOff className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold headline">Dia de Descanso Ativo</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                           Aproveite para focar na mobilidade e recuperação. Sua próxima evolução começa no próximo treino!
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const allExercises = treino.exercicios || [];
    const completedCount = Object.values(checkedExercises).filter(Boolean).length;
    const progressPerc = Math.round((completedCount / allExercises.length) * 100) || 0;
    
    return (
        <Card glass className="border-cyan-500/10 shadow-cyan-500/5">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-2xl font-bold text-gradient-cyan">
                       {treino.objetivo}
                   </CardTitle>
                   <CardDescription className="text-muted-foreground/80 mt-1">
                       Desempenho atual: {progressPerc}% completo
                   </CardDescription>
                </div>
                <div className="hidden sm:block">
                    <CircularProgress value={progressPerc} size="sm" strokeWidth={6} showValue gradient="cyan" />
                </div>
            </CardHeader>
            <CardContent className="grid gap-4">
                {allExercises.map((exercicio) => (
                    <div 
                        key={exercicio.id} 
                        className={cn(
                            "group rounded-xl border border-white/5 p-4 flex items-center justify-between transition-all duration-300 hover:bg-white/5",
                            checkedExercises[exercicio.id] && "bg-cyan-500/10 border-cyan-500/30"
                        )}
                    >
                        <div className="flex items-center gap-4">
                             <Checkbox
                                id={exercicio.id}
                                checked={checkedExercises[exercicio.id] || false}
                                onCheckedChange={() => handleCheckChange(exercicio.id)}
                                className="h-6 w-6 border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                            />
                            <div>
                                <label 
                                    htmlFor={exercicio.id} 
                                    className={cn(
                                        "font-bold text-lg cursor-pointer transition-all",
                                        checkedExercises[exercicio.id] ? "text-cyan-400" : "text-white/90"
                                    )}
                                >
                                    {exercicio.nomeExercicio}
                                </label>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                                    {exercicio.series} x {exercicio.repeticoes} • REPETIÇÕES
                                </p>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                             {exercicio.descricao && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => onViewExercicio(exercicio)}
                                    className="hover:text-cyan-400"
                                >
                                    <Info className="h-5 w-5" />
                                </Button>
                            )}
                         </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="bg-white/5 p-6 border-t border-white/5">
                <Button 
                    variant="premium"
                    size="lg"
                    onClick={handleFinishClick} 
                    disabled={completedCount === 0 || isFeedbackLoading} 
                    className="w-full text-lg h-14 font-bold tracking-tight rounded-xl"
                >
                    {isFeedbackLoading ? (
                        <div className="flex items-center gap-2">
                           <BrainCircuit className="animate-pulse" />
                           Processando análise...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                           <Sparkles className="h-5 w-5" />
                           Finalizar e Avaliar Treino
                        </div>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}

// Componente para o feedback da IA
function CardFeedback({ feedback, isLoading }: { feedback: { title: string; message: string; } | null, isLoading: boolean }) {
    if (isLoading) {
        return (
             <Card glass className="border-cyan-500/20 glow-cyan">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-cyan-400">
                        <BrainCircuit className="h-6 w-6 animate-pulse" />
                        <span className="headline">Pulsando Bio-Dados...</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-4 w-2/3 bg-white/5" />
                </CardContent>
            </Card>
        )
    }

    if (!feedback) return null;

    return (
        <Card glass className="border-cyan-500/40 shadow-cyan-500/10 animate-in fade-in zoom-in duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-cyan-400">
                    <Sparkles className="h-6 w-6" />
                    <span className="headline text-2xl">{feedback.title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                    <p className="text-foreground/90 text-sm leading-relaxed italic">
                        "{feedback.message}"
                    </p>
                </div>
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
            const exerciseNames = completedExercises
                .map(id => initialTreino.exercicios?.find(ex => ex.id === id)?.nomeExercicio)
                .filter((name): name is string => !!name);
            const aiResult = await generateWorkoutFeedback({
                goal: initialTreino.objetivo,
                completedExercises: exerciseNames,
                totalExercises: initialTreino.exercicios?.length || 0,
            });
            setFeedback(aiResult);
            const result = await finalizarTreinoAction(initialTreino.id);
            if (result.success) {
                toast({ 
                    title: "Treino Sincronizado!", 
                    description: "+500 XP adicinados ao seu perfil.",
                    className: "glass-card border-cyan-500/50" 
                });
            } else {
                toast({ title: "Erro de conexão", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error:", error);
            setFeedback({
                title: "Erro de Processamento",
                message: "Não conseguimos gerar do feedback da IA, mas seu treino foi salvo localmente."
            });
        } finally {
            setIsFeedbackLoading(false);
        }
    };

    const xpToNextLevel = aluno.xpToNextLevel ?? (aluno.nivel * 1500);
    const progressPerc = aluno.progressPerc ?? Math.min(Math.round((aluno.exp / xpToNextLevel) * 100), 100);

    return (
       <div className="max-w-7xl mx-auto px-4 pb-20 bg-black min-h-screen">
            <ExercicioViewer 
                exercicio={selectedExercicio}
                isOpen={isViewerOpen}
                onOpenChange={setIsViewerOpen}
            />
            
            {/* Header / Hero Section */}
            <motion.div
                className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <div>
                   <h1 className="text-4xl md:text-6xl font-black headline tracking-tighter text-white">
                       FALA, <span className="text-cyan-400">{aluno.nomeCompleto.split(' ')[0].toUpperCase()}!</span>
                   </h1>
                   <p className="text-muted-foreground mt-2 font-medium">Bora subir de nível hoje?</p>
                </div>
                
                <div className="flex gap-4">
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                        <Card glass className="px-6 py-4 flex items-center gap-4 bg-[#18181B] border-white/10 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-shadow">
                            <div className="text-center">
                                <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">Streak</p>
                                <p className="text-2xl font-mono font-bold tracking-tight text-orange-500">{aluno.streakDiasSeguidos}🔥</p>
                            </div>
                        </Card>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                        <Card glass className="px-6 py-4 flex items-center gap-4 bg-[#18181B] border-white/10 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-shadow">
                            <div className="text-center">
                                <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">Treinos/Mês</p>
                                <p className="text-2xl font-mono font-bold tracking-tight text-cyan-400">{aluno.treinosNoMes}</p>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
                initial="initial"
                animate="animate"
                variants={{
                    initial: { opacity: 0 },
                    animate: {
                        opacity: 1,
                        transition: { staggerChildren: 0.15 }
                    }
                }}
            >
                    {/* Main Content: Training */}
                    <motion.div
                        className="lg:col-span-8 flex flex-col gap-8"
                        variants={{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
                        }}
                    >
                        <CardTreino 
                            treino={initialTreino} 
                            onFinishTraining={handleFinishTraining}
                            isFeedbackLoading={isFeedbackLoading}
                            onViewExercicio={handleViewExercicio}
                        />
                        <CardFeedback feedback={feedback} isLoading={isFeedbackLoading} />
                    </motion.div>

                    {/* Sidebar: Progress & Achievements */}
                    <motion.div
                        className="lg:col-span-4 flex flex-col gap-8"
                        variants={{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
                        }}
                    >
                        {/* Progress Ring Card */}
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <Card glass className="bg-[#18181B] p-6 border-white/10 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-shadow">
                                <div className="flex flex-col items-center text-center">
                                    <CircularProgress value={progressPerc} size="lg" strokeWidth={10} showValue gradient="cyan" label="Level Progress" />
                                    <div className="mt-6">
                                        <h3 className="text-3xl font-mono font-bold tracking-tight text-white">NÍVEL {aluno.nivel}</h3>
                                        <p className="text-sm text-zinc-400 font-bold mt-1">
                                            {aluno.exp} / {xpToNextLevel} <span className="text-cyan-400">XP</span>
                                        </p>
                                    </div>
                                    <div className="w-full h-[1px] bg-white/10 my-6" />
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <TrendingUp className="h-5 w-5 text-cyan-400 mx-auto mb-2" />
                                            <p className="text-[10px] uppercase text-zinc-400 font-bold italic">Meta Semanal</p>
                                            <p className="text-lg font-mono font-bold tracking-tight text-cyan-400">80%</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
                                            <p className="text-[10px] uppercase text-zinc-400 font-bold italic">Power Index</p>
                                            <p className="text-lg font-mono font-bold tracking-tight text-cyan-400">752</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Trophy Room (Gamification Step) */}
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <Card glass className="p-6 bg-[#18181B] border-white/10 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold tracking-tight headline flex items-center gap-2 text-white">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        CONQUISTAS
                                    </h3>
                                    <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold text-amber-500">Ver Todas</Button>
                                </div>
                                <div className="flex justify-around gap-2">
                                    <div className="flex flex-col items-center gap-1 opacity-100 group cursor-pointer">
                                        <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center glow-gold text-amber-500">
                                            <Award className="h-8 w-8" />
                                        </div>
                                        <span className="text-[8px] font-bold uppercase text-amber-500 text-center">Iniciante Elite</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 opacity-40 grayscale group cursor-pointer hover:opacity-70 transition-all">
                                        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                            <Target className="h-8 w-8" />
                                        </div>
                                        <span className="text-[8px] font-bold uppercase text-center text-zinc-400">Mestre da Constância</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 opacity-40 grayscale group cursor-pointer hover:opacity-70 transition-all">
                                        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                            <Zap className="h-8 w-8" />
                                        </div>
                                        <span className="text-[8px] font-bold uppercase text-center text-zinc-400">Fisioculturista</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <CardMatricula aluno={aluno} />
                    </motion.div>
            </motion.div>
       </div>
    );
}
