
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXERCICIOS_POR_GRUPO, DIAS_DA_SEMANA } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Trash2, Wand2, BrainCircuit, Pencil, FileSignature, User, Dumbbell } from "lucide-react";
import type { Exercicio, Treino } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Combobox } from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  generateWorkoutPlan
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
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";

const flatExerciciosOptions = EXERCICIOS_POR_GRUPO.flatMap(g => g.exercicios.map(ex => ({ value: ex.nomeExercicio, label: ex.nomeExercicio, description: ex.descricao })));
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
    const [objetivo, setObjetivo] = useState('');
    const [exercicios, setExercicios] = useState<Partial<Exercicio>[]>([]);
    
    useEffect(() => {
        if(treinoToEdit) {
            setObjetivo(treinoToEdit.objetivo);
            setExercicios(treinoToEdit.exercicios);
        } else {
            setObjetivo('');
            setExercicios([]);
        }
    }, [treinoToEdit]);

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
                const selectedOption = flatExerciciosOptions.find(opt => opt.value === value);
                return { 
                    ...ex, 
                    nomeExercicio: value,
                    descricao: selectedOption?.description || "" // Preenche a descrição
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
            diaSemana: treinoToEdit ? treinoToEdit.diaSemana : null, // Mantém o dia se estiver editando
            dataCriacao: new Date().toISOString()
        }
        onSave(novoTreino);
        setObjetivo('');
        setExercicios([]);
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
                        {exercicios.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-4">Nenhum exercício adicionado.</div>
                        )}
                        <Button variant="outline" onClick={handleAddExercicio}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Exercício Manualmente
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className='gap-2'>
                    <Button onClick={handleSaveTreino} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={exercicios.length === 0}>
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

export default function MeusTreinosPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const treinosCollectionRef = useMemoFirebase(
      () => (firestore && user ? collection(firestore, 'alunos', user.uid, 'treinos') : null),
      [firestore, user]
    );

    const { data: meusTreinos, isLoading: isLoadingTreinos } = useCollection<Treino>(treinosCollectionRef);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingTreino, setEditingTreino] = useState<Treino | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [deletingTreino, setDeletingTreino] = useState<Treino | null>(null);

    const { treinosDoPersonal, treinosDoAluno } = useMemo(() => {
        if (!meusTreinos) {
            return { treinosDoPersonal: [], treinosDoAluno: [] };
        }
        // Treinos do personal são todos que não foram criados pelo próprio aluno (instrutorId diferente do UID do aluno).
        const treinosDoPersonal = meusTreinos.filter(t => t.instrutorId !== user?.uid);
        const treinosDoAluno = meusTreinos.filter(t => t.instrutorId === user?.uid);
        return { treinosDoPersonal, treinosDoAluno };
    }, [meusTreinos, user]);


    const handleSave = async (treinoData: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'>) => {
        if (!treinosCollectionRef || !user) return;
    
        try {
            if (editingTreino) {
                const treinoRef = doc(treinosCollectionRef, editingTreino.id);
                await updateDoc(treinoRef, treinoData);
                toast({ title: 'Treino atualizado com sucesso!', className: 'bg-accent text-accent-foreground' });
            } else {
                await addDoc(treinosCollectionRef, {
                    ...treinoData,
                    alunoId: user.uid,
                    instrutorId: user.uid, // O próprio aluno é o "instrutor"
                });
                toast({ title: 'Novo treino salvo com sucesso!', className: 'bg-accent text-accent-foreground' });
            }
            setIsFormVisible(false);
            setEditingTreino(null);
        } catch (error) {
            console.error("Erro ao salvar treino:", error);
            toast({ title: "Erro ao salvar", description: "Não foi possível salvar o treino. Tente novamente.", variant: "destructive" });
        }
    };
    
    const handleEdit = (treino: Treino) => {
        setEditingTreino(treino);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleDayChange = async (treinoId: string, dia: string) => {
        if (!treinosCollectionRef || !meusTreinos) return;
        const novoDia = dia === "nenhum" ? null : parseInt(dia, 10);

        // Verifica se já existe um treino (de qualquer origem) agendado para o novo dia.
const treinoExistente = novoDia !== null ? meusTreinos.find(t => t.diaSemana === novoDia) : null;

if (treinoExistente && treinoExistente.id !== treinoId) {
    const treinoAtual = meusTreinos.find(t => t.id === treinoId);
    const diaAtual = treinoAtual ? treinoAtual.diaSemana : null;

    const treinoExistenteRef = doc(treinosCollectionRef, treinoExistente.id);
    const treinoAtualRef = doc(treinosCollectionRef, treinoId);

    try {
        await updateDoc(treinoExistenteRef, { diaSemana: diaAtual });
        await updateDoc(treinoAtualRef, { diaSemana: novoDia });
        toast({ title: 'Treinos trocados com sucesso!' });
    } catch (error) {
        console.error("Erro ao trocar treinos:", error);
        toast({ title: "Erro ao atualizar agenda", variant: "destructive" });
    }
} else {
    const treinoRef = doc(treinosCollectionRef, treinoId);
    try {
        await updateDoc(treinoRef, { diaSemana: novoDia });
        toast({ title: 'Agenda atualizada!' });
    } catch (error) {
        console.error("Erro ao atualizar dia do treino:", error);
        toast({ title: "Erro ao atualizar agenda", variant: "destructive" });
    }
        }
    };
    
    const openDeleteAlert = (treino: Treino) => {
        setDeletingTreino(treino);
        setIsAlertOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingTreino || !treinosCollectionRef) return;
        
        try {
            await deleteDoc(doc(treinosCollectionRef, deletingTreino.id));
            toast({ title: 'Treino excluído!', variant: 'destructive' });
        } catch (error) {
            console.error("Erro ao excluir treino:", error);
            toast({ title: "Erro ao excluir", variant: "destructive" });
        }

        setIsAlertOpen(false);
        setDeletingTreino(null);
    };

    const handleOpenNewForm = () => {
        setEditingTreino(null);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleGenerate = async (data: WorkoutGeneratorInput) => {
        if (!treinosCollectionRef || !meusTreinos || !user) return;

        setIsGenerating(true);
        setIsFormVisible(false);
        setEditingTreino(null);
        try {
            const result = await generateWorkoutPlan(data);
            
            for (const workout of result.workouts) {
                const novosExercicios = workout.exercicios.map((ex, index) => ({
                    id: `${Date.now()}-${index}`,
                    nomeExercicio: ex.nomeExercicio,
                    series: ex.series,
                    repeticoes: ex.repeticoes,
                    observacoes: ex.observacoes,
                    descricao: flatExerciciosOptions.find(opt => opt.value === ex.nomeExercicio)?.description || ""
                }));

                const diaSugerido = workout.diaSugerido;
                const isDayOccupied = meusTreinos.some(t => t.diaSemana === diaSugerido);

                await addDoc(treinosCollectionRef, {
                    alunoId: user.uid,
                    instrutorId: user.uid, // Gerado pelo aluno, então ele é o instrutor
                    objetivo: workout.nome,
                    exercicios: novosExercicios,
                    diaSemana: isDayOccupied ? null : diaSugerido,
                    dataCriacao: new Date().toISOString()
                });
            }
            
            toast({
                title: "Plano Pessoal Gerado pela IA!",
                description: `${result.planName} foi criado com ${result.workouts.length} treinos. Agende-os na seção 'Meus Treinos Pessoais'.`,
                duration: 5000,
            });
        } catch (error) {
            console.error("Erro ao gerar treino com IA:", error);
            toast({ title: "Erro da IA", description: "Não foi possível gerar o plano. Tente novamente.", variant: "destructive" });
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
                {isLoadingTreinos && Array.from({length: 2}).map((_, i) => <Skeleton key={i} className='h-20 w-full' />)}
                {!isLoadingTreinos && treinos.map(treino => (
                    <div key={treino.id} className={cn("rounded-lg border p-4 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4", treino.diaSemana !== null && "bg-accent/10 border-accent")}>
                       <div className='flex-1'>
                            <div className='flex items-center gap-3'>
                                <h3 className="font-bold text-base">{treino.objetivo}</h3>
                                {treino.diaSemana !== null && <Badge>{getDiaLabel(treino.diaSemana)}</Badge>}
                                {treino.instrutorId !== user?.uid && <Badge variant="secondary">Do Personal</Badge>}
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
        <SelectItem key={dia.value} value={String(dia.value)} data-testid={`select-day-${dia.value}`}>
                                            {dia.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                {!isLoadingTreinos && treinos.length === 0 && (
                     <div className="text-center text-sm text-muted-foreground py-10">
                        {allowEditing ? 'Você ainda não criou nenhum treino. Use o gerador de IA ou crie um manualmente.' : 'Nenhum treino prescrito pelo seu personal ainda.'}
                     </div>
                )}
            </CardContent>
        </Card>
    );

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
                    "Treinos criados e enviados pelo seu instrutor. Agende um dia da semana para ativá-los.",
                    <FileSignature className="text-primary" />,
                    false
                )}
                
                {renderWorkoutList(
                    treinosDoAluno,
                    "Meus Treinos Pessoais",
                    "Treinos que você criou manualmente ou gerou com a IA. Você tem controle total sobre eles.",
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
                        <Button onClick={handleOpenNewForm} variant="outline" size="lg">
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
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o treino <span className="font-bold">{deletingTreino?.objetivo}</span>.
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
