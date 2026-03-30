
"use client";

import { useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { streamFlow } from "@genkit-ai/next/client";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXERCICIOS_POR_GRUPO, DIAS_DA_SEMANA } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Trash2, Wand2, BrainCircuit, Pencil, FileSignature, User, Dumbbell, Play } from "lucide-react";
import type { Exercicio, Treino, HistoricoTreino } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { WorkoutSession } from '@/components/WorkoutSession';
import { Combobox } from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  streamWorkoutPlan
} from "@/ai/flows/workout-generator-flow";
import {
  WorkoutGeneratorInputSchema,
  type WorkoutGeneratorInput,
} from "@/ai/schemas";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { upsertTreinoAction, updateTreinoDayAction, deleteTreinoAction, registrarHistoricoTreinoAction } from '@/lib/actions/treinos';

const flatExerciciosOptions = EXERCICIOS_POR_GRUPO.flatMap(g => g.exercicios.map(ex => ({ value: ex.nomeExercicio, label: ex.nomeExercicio, description: ex.descricao })));
const exercicioDescriptionsMap = new Map(flatExerciciosOptions.map(opt => [opt.value, opt.description]));
const exerciciosOptions = EXERCICIOS_POR_GRUPO.map(grupo => ({
    label: grupo.grupo,
    options: grupo.exercicios.map(ex => ({
        value: ex.nomeExercicio,
        label: ex.nomeExercicio,
        keywords: [grupo.grupo],
    }))
}));

function WorkoutGenerator({ onGenerate, isGenerating }: { onGenerate: (data: WorkoutGeneratorInput) => Promise<void>, isGenerating: boolean }) {
    const form = useForm<WorkoutGeneratorInput>({
        resolver: zodResolver(WorkoutGeneratorInputSchema),
        defaultValues: {
            diasPorSemana: 3,
            objetivo: "Hipertrofia",
            nivelExperiencia: "Iniciante",
            observacoesAdicionais: ""
        }
    });

    return (
        <Card className="bg-secondary border-primary/20">
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Wand2 className='text-primary' />
                    Gerador de Plano Semanal com IA
                </CardTitle>
                <CardDescription>
                    Preencha seus dados para que a IA crie uma divisão de treinos completa para sua semana.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form id="ai-generator-form" onSubmit={form.handleSubmit(onGenerate)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name="objetivo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objetivo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Hipertrofia">Hipertrofia</SelectItem>
                                            <SelectItem value="Perda de Peso">Perda de Peso</SelectItem>
                                            <SelectItem value="Força">Força</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="nivelExperiencia"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meu Nível</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Iniciante">Iniciante</SelectItem>
                                            <SelectItem value="Intermediário">Intermediário</SelectItem>
                                            <SelectItem value="Avançado">Avançado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="diasPorSemana"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dias/Semana</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} max={7} {...field} onChange={e => {
                                            const value = parseInt(e.target.value, 10);
                                            field.onChange(isNaN(value) ? '' : value);
                                        }}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <div className='md:col-span-2 lg:col-span-1'>
                             <FormField
                                control={form.control}
                                name="observacoesAdicionais"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observações (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ex: Lesão no joelho direito' {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                         </div>
                    </form>
                </Form>
            </CardContent>
            <CardFooter>
                 <Button type="submit" form="ai-generator-form" disabled={isGenerating}>
                    {isGenerating ? <><BrainCircuit className="mr-2 h-4 w-4 animate-pulse" /> Gerando Plano...</> : <><Wand2 className="mr-2 h-4 w-4" /> Gerar Plano Pessoal com IA</>}
                 </Button>
            </CardFooter>
        </Card>
    );
}

function WorkoutEditor({ onSave, treinoToEdit, onCancel }: { onSave: (treino: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'>) => void, treinoToEdit: Treino | null, onCancel: () => void }) {
    const {toast} = useToast();
    const [objetivo, setObjetivo] = useState(treinoToEdit?.objetivo || '');
    const [exercicios, setExercicios] = useState<Partial<Exercicio>[]>(treinoToEdit?.exercicios || []);
    
    const handleAddExercicio = () => {
        setExercicios([...exercicios, { id: `${Date.now()}`, nomeExercicio: '', series: 3, repeticoes: '10-12', observacoes: '', descricao: '' }]);
    };

    const handleRemoveExercicio = (id: string) => {
        setExercicios(exercicios.filter(ex => ex.id !== id));
    };

    const handleExercicioChange = (id: string, field: keyof Exercicio, value: string | number) => {
        setExercicios(exercicios.map(ex => {
             if (ex.id !== id) return ex;

            // Se o campo alterado for o nome do exercício, busca e preenche a descrição.
            if (field === 'nomeExercicio' && typeof value === 'string') {
                return { 
                    ...ex, 
                    nomeExercicio: value,
                    descricao: exercicioDescriptionsMap.get(value) || "" // Preenche a descrição
                };
            }
            return { ...ex, [field]: value };
        }));
    };

    const handleSaveTreino = () => {
        if (!objetivo || exercicios.length === 0 || exercicios.some(e => !e.nomeExercicio)) {
            toast({
                title: "Erro ao salvar",
                description: "Preencha o objetivo e todos os exercícios antes de salvar.",
                variant: "destructive"
            });
            return;
        }

        const novoTreino: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'> = {
            objetivo,
            exercicios: exercicios as Exercicio[],
            diaSemana: treinoToEdit ? treinoToEdit.diaSemana : null,
            dataCriacao: new Date().toISOString()
        }
        onSave(novoTreino);
    }

    return (
        <div className='grid gap-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Dumbbell />
                        {treinoToEdit ? 'Editar Treino Pessoal' : 'Criar Novo Treino Pessoal'}
                    </CardTitle>
                    <CardDescription>Crie um plano de treino do zero ou ajuste um existente que você criou.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className='grid gap-2'>
                        <Label htmlFor="objetivo">Nome/Objetivo do Treino</Label>
                        <Input id="objetivo" placeholder="Ex: Treino de adaptação" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
                    </div>

                    <div className="grid gap-4">
                        <h3 className='font-medium'>Exercícios</h3>
                        {exercicios.map((exercicio, index) => (
                            <div key={exercicio.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr_auto] items-end gap-3 rounded-md border p-4">
                                <div className="grid gap-2">
                                    {index === 0 && <Label className='md:hidden'>Nome</Label>}
                                    <Combobox 
                                        options={exerciciosOptions} 
                                        flatOptions={flatExerciciosOptions}
                                        value={exercicio.nomeExercicio}
                                        onChange={(value) => handleExercicioChange(exercicio.id!, 'nomeExercicio', value)}
                                        placeholder='Selecione...'
                                        searchPlaceholder='Buscar exercício...'
                                        notFoundMessage='Nenhum exercício encontrado.'
                                    />
                                </div>
                                <div className="grid gap-2">
                                    {index === 0 && <Label className='md:hidden'>Séries</Label>}
                                    <Input type="number" className='w-full md:w-20' value={exercicio.series || ''} onChange={(e) => handleExercicioChange(exercicio.id!, 'series', parseInt(e.target.value))}/>
                                </div>
                                <div className="grid gap-2">
                                     {index === 0 && <Label className='md:hidden'>Reps</Label>}
                                    <Input placeholder="10-12" className='w-full md:w-24' value={exercicio.repeticoes || ''} onChange={(e) => handleExercicioChange(exercicio.id!, 'repeticoes', e.target.value)}/>
                                </div>
                                <div className="grid gap-2">
                                     {index === 0 && <Label className='md:hidden'>Obs</Label>}
                                    <Input placeholder="Opcional" value={exercicio.observacoes || ''} onChange={(e) => handleExercicioChange(exercicio.id!, 'observacoes', e.target.value)}/>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveExercicio(exercicio.id!)} aria-label="Remover exercício" className='justify-self-end'>
                                    <Trash2 className='h-4 w-4 text-destructive'/>
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={handleAddExercicio}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Exercício Manualmente
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className='gap-2'>
                    <Button onClick={handleSaveTreino} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Save className="mr-2 h-4 w-4" />
                        {treinoToEdit ? 'Salvar Alterações' : 'Salvar Novo Treino'}
                    </Button>
                     <Button variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function MeusTreinosClient({ initialTreinos, userId }: { initialTreinos: Treino[], userId: string }) {
    const { toast } = useToast();
    const [meusTreinos, setMeusTreinos] = useState<Treino[]>(initialTreinos);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingTreino, setEditingTreino] = useState<Treino | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [deletingTreino, setDeletingTreino] = useState<Treino | null>(null);
    const [treinoEmSessao, setTreinoEmSessao] = useState<Treino | null>(null);

    const { treinosDoPersonal, treinosDoAluno } = useMemo(() => {
        const treinosDoPersonal = meusTreinos.filter(t => t.instrutorId !== userId);
        const treinosDoAluno = meusTreinos.filter(t => t.instrutorId === userId);
        return { treinosDoPersonal, treinosDoAluno };
    }, [meusTreinos, userId]);


    const handleSave = async (treinoData: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'>) => {
        try {
            const res = await upsertTreinoAction({
                ...treinoData,
                id: editingTreino?.id,
                alunoId: userId,
                instrutorId: userId
            });

            if (res.success) {
                toast({ title: editingTreino ? 'Treino atualizado!' : 'Novo treino salvo!', className: 'bg-accent text-accent-foreground' });
                setIsFormVisible(false);
                setEditingTreino(null);
                // No final migration state, we rely on revalidatePath, but for better UX we could fetch again or update local state
                window.location.reload(); 
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        }
    };
    
    const handleEdit = (treino: Treino) => {
        setEditingTreino(treino);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleDayChange = async (treinoId: string, dia: string) => {
        const novoDia = dia === "nenhum" ? null : parseInt(dia, 10);

        if (novoDia !== null && meusTreinos.some(t => t.diaSemana === novoDia && t.id !== treinoId)) {
            toast({ title: "Dia já ocupado", description: "Já existe outro treino agendado para este dia.", variant: "destructive" });
            return;
        }

        try {
            const res = await updateTreinoDayAction(treinoId, novoDia);
            if (res.success) {
                toast({ title: 'Agenda atualizada!' });
                setMeusTreinos(meusTreinos.map(t => t.id === treinoId ? { ...t, diaSemana: novoDia } : t));
            }
        } catch (error) {
            toast({ title: "Erro ao atualizar agenda", variant: "destructive" });
        }
    };
    
    const openDeleteAlert = (treino: Treino) => {
        setDeletingTreino(treino);
        setIsAlertOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingTreino) return;
        
        try {
            const res = await deleteTreinoAction(deletingTreino.id);
            if (res.success) {
                toast({ title: 'Treino excluído!', variant: 'destructive' });
                setMeusTreinos(meusTreinos.filter(t => t.id !== deletingTreino.id));
            }
        } catch (error) {
            toast({ title: "Erro ao excluir", variant: "destructive" });
        }

        setIsAlertOpen(false);
        setDeletingTreino(null);
    };

    const handleGenerate = async (data: WorkoutGeneratorInput) => {
        setIsGenerating(true);
        try {
            const { stream } = streamWorkoutPlan(data) as any;
            let result: any = null;
            for await (const chunk of stream) {
                if (chunk) {
                    // Update UI progressively if needed
                    result = chunk;
                }
            }
            
            if (result && result.workouts) {
            for (const workout of result.workouts) {
                const novosExercicios = workout.exercicios.map((ex: any, index: number) => ({
                    nomeExercicio: ex.nomeExercicio,
                    series: ex.series,
                    repeticoes: ex.repeticoes,
                    observacoes: ex.observacoes,
                    descricao: exercicioDescriptionsMap.get(ex.nomeExercicio) || ""
                }));

                const diaSugerido = workout.diaSugerido;
                const isDayOccupied = meusTreinos.some(t => t.diaSemana === diaSugerido);

                await upsertTreinoAction({
                    alunoId: userId,
                    instrutorId: userId,
                    objetivo: workout.nome,
                    exercicios: novosExercicios,
                    diaSemana: isDayOccupied ? null : diaSugerido,
                });
            }
            
            toast({
                title: "Plano Pessoal Gerado!",
                description: `${result.planName} foi criado.`,
                duration: 5000,
            });
            window.location.reload();
            }
        } catch (error) {
            toast({ title: "Erro da IA", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    const getDiaLabel = (diaSemana: number | null) => {
        if (diaSemana === null) return null;
        return DIAS_DA_SEMANA.find(d => d.value === diaSemana)?.label;
    };

    const renderWorkoutList = (treinos: Treino[], title: string, description: string, icon: React.ReactNode, allowEditing: boolean) => (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>{icon} {title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4'>
                {treinos.map(treino => (
                    <div key={treino.id} className={cn("rounded-lg border p-4 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4", treino.diaSemana !== null && "bg-accent/10 border-accent")}>
                       <div className='flex-1'>
                            <div className='flex items-center gap-3'>
                                <h3 className="font-bold text-base">{treino.objetivo}</h3>
                                {treino.diaSemana !== null && <Badge>{getDiaLabel(treino.diaSemana)}</Badge>}
                                {treino.instrutorId !== userId && <Badge variant="secondary">Do Personal</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {treino.exercicios.length} exercícios
                            </p>
                       </div>
                       <div className='flex items-center gap-2 flex-wrap'>
                            <Select
                                value={treino.diaSemana === null ? "nenhum" : String(treino.diaSemana)}
                                onValueChange={(value) => handleDayChange(treino.id, value)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Agendar dia..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nenhum">Nenhum (Desativado)</SelectItem>
                                    {DIAS_DA_SEMANA.map(dia => (
                                        <SelectItem key={dia.value} value={String(dia.value)}>
                                            {dia.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button size="sm" onClick={() => setTreinoEmSessao(treino)}>
                                <Play className='mr-2 h-4 w-4' />
                                Iniciar
                            </Button>
                            {allowEditing && (
                                <>
                                    <Button variant="secondary" size="sm" onClick={() => handleEdit(treino)}>
                                        <Pencil className='mr-2 h-4 w-4' />
                                        Editar
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => openDeleteAlert(treino)}>
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        Excluir
                                    </Button>
                                </>
                            )}
                       </div>
                    </div>
                ))}
                {treinos.length === 0 && (
                     <div className="text-center text-sm text-muted-foreground py-10">
                        {allowEditing ? 'Você ainda não criou nenhum treino.' : 'Nenhum treino prescrito pelo seu personal ainda.'}
                     </div>
                )}
            </CardContent>
        </Card>
    );

    const handleFinishWorkout = async (historico: Omit<HistoricoTreino, 'id' | 'alunoId'>) => {
        try {
            const res = await registrarHistoricoTreinoAction(historico);
            if (res.success) {
                toast({
                    title: "Treino Finalizado!",
                    description: "Seu progresso e XP foram salvos!",
                    className: "bg-green-600 text-white",
                });
                setTreinoEmSessao(null);
                window.location.reload();
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            toast({ title: "Erro ao salvar histórico", variant: "destructive" });
        }
    };

    if (treinoEmSessao) {
        return (
            <WorkoutSession
                treino={treinoEmSessao}
                onFinish={handleFinishWorkout}
                onCancel={() => setTreinoEmSessao(null)}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Meus Treinos"
                description="Agende os treinos enviados pelo seu personal ou crie e gerencie seus próprios planos."
            />
            
             <div className='grid gap-8'>

                {renderWorkoutList(
                    treinosDoPersonal,
                    "Planos do Personal",
                    "Treinos criados e enviados pelo seu instrutor.",
                    <FileSignature className="text-primary" />,
                    false
                )}
                
                {renderWorkoutList(
                    treinosDoAluno,
                    "Meus Treinos Pessoais",
                    "Treinos que você criou manualmente ou gerou com a IA.",
                    <User />,
                    true
                )}

                <WorkoutGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />
                
                {isFormVisible && (
                     <div className='mb-8'>
                        <WorkoutEditor 
                            onSave={handleSave} 
                            treinoToEdit={editingTreino}
                            onCancel={() => {
                                setIsFormVisible(false);
                                setEditingTreino(null);
                            }}
                        />
                     </div>
                )}

                 {!isFormVisible && (
                     <div className="text-center">
                        <Button onClick={() => { setEditingTreino(null); setIsFormVisible(true); }} variant="outline" size="lg">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Criar Novo Treino Manualmente
                        </Button>
                     </div>
                 )}
            </div>

             <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Essa ação excluirá permanentemente o treino <span className="font-bold">{deletingTreino?.objetivo}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
