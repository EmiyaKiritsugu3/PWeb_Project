import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CalendarOff, Sparkles, BrainCircuit, Info } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";
import type { Treino, Exercicio } from "@/lib/definitions";
import { useWorkoutTracker } from "@/hooks/use-workout-tracker";

interface CardTreinoProps {
    treino: Treino | null;
    onFinishTraining: (completedExercises: string[]) => void;
    isFeedbackLoading: boolean;
    onViewExercicio: (exercicio: Exercicio) => void;
}

export function CardTreino({ 
    treino, 
    onFinishTraining, 
    isFeedbackLoading,
    onViewExercicio
}: CardTreinoProps) {
    const { checkedExercises, handleCheckChange } = useWorkoutTracker(treino);
    
    const handleFinishClick = () => {
        const completed = Object.keys(checkedExercises).filter(id => checkedExercises[id]);
        onFinishTraining(completed);
    };

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
