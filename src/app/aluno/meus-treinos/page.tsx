
"use client";

import { useState, useEffect } from 'react';
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
import { EXERCICIOS_POR_GRUPO, TREINOS as mockTreinos } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Trash2, Wand2, BrainCircuit, CheckCircle, Pencil } from "lucide-react";
import type { Exercicio, Treino } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
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

const flatExerciciosOptions = EXERCICIOS_POR_GRUPO.flatMap(g => g.exercicios.map(ex => ({ value: ex.nomeExercicio, label: ex.nomeExercicio })));
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
                                        <Input type="number" min={1} max={7} {...field} onChange={e => field.onChange(parseInt(e.target.value))}/>
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
                    {isGenerating ? <><BrainCircuit className="mr-2 h-4 w-4 animate-pulse" /> Gerando Plano...</> : <><Wand2 className="mr-2 h-4 w-4" /> Gerar Plano Semanal</>}
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
        setExercicios([...exercicios, { id: `${Date.now()}`, nomeExercicio: '', series: 3, repeticoes: '10-12', observacoes: '' }]);
    };

    const handleRemoveExercicio = (id: string) => {
        setExercicios(exercicios.filter(ex => ex.id !== id));
    };

    const handleExercicioChange = (id: string, field: keyof Exercicio, value: string | number) => {
        setExercicios(exercicios.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
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

        const novoTreino = {
            objetivo,
            exercicios: exercicios as Exercicio[],
            ativo: false,
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
                    <CardTitle>{treinoToEdit ? 'Editar Treino' : 'Criar Novo Treino'}</CardTitle>
                    <CardDescription>Ajuste os exercícios manualmente. Para gerar um novo plano com IA, use o gerador acima.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className='grid gap-2'>
                        <Label htmlFor="objetivo">Nome/Objetivo do Treino</Label>
                        <Input id="objetivo" placeholder="Ex: Treino A - Peito e Tríceps" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
                    </div>

                    <div className="grid gap-4">
                        <h3 className='font-medium'>Exercícios</h3>
                        {exercicios.map((exercicio, index) => (
                            <div key={exercicio.id} className="grid grid-cols-[1fr_auto_auto_1fr_auto] items-end gap-3 rounded-md border p-4">
                                <div className="grid gap-2">
                                    {index === 0 && <Label>Nome do Exercício</Label>}
                                    <Combobox 
                                        options={exerciciosOptions} 
                                        flatOptions={flatExerciciosOptions}
                                        value={exercicio.nomeExercicio || ''}
                                        onChange={(value) => handleExercicioChange(exercicio.id!, 'nomeExercicio', value)}
                                        placeholder='Selecione...'
                                        searchPlaceholder='Buscar exercício...'
                                        notFoundMessage='Nenhum exercício encontrado.'
                                    />
                                </div>
                                <div className="grid gap-2">
                                    {index === 0 && <Label>Séries</Label>}
                                    <Input type="number" className='w-20' value={exercicio.series || ''} onChange={(e) => handleExercicioChange(exercicio.id!, 'series', parseInt(e.target.value))}/>
                                </div>
                                <div className="grid gap-2">
                                    {index === 0 && <Label>Reps</Label>}
                                    <Input placeholder="10-12" className='w-24' value={exercicio.repeticoes || ''} onChange={(e) => handleExercicioChange(exercicio.id!, 'repeticoes', e.target.value)}/>
                                </div>
                                <div className="grid gap-2">
                                    {index === 0 && <Label>Obs</Label>}
                                    <Input placeholder="Opcional" value={exercicio.observacoes || ''} onChange={(e) => handleExercicioChange(exercicio.id!, 'observacoes', e.target.value)}/>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveExercicio(exercicio.id!)} aria-label="Remover exercício">
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
    const { toast } = useToast();

    // Simulação de dados
    const [meusTreinos, setMeusTreinos] = useState<Treino[]>(() => mockTreinos.filter(t => t.alunoId === '1'));
    const [isGenerating, setIsGenerating] = useState(false);

    // Estado para o formulário
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingTreino, setEditingTreino] = useState<Treino | null>(null);

    // Estado para o alerta de exclusão
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [deletingTreino, setDeletingTreino] = useState<Treino | null>(null);

    const handleSave = (treinoData: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'>) => {
        if (editingTreino) {
            // Edita o treino existente
            setMeusTreinos(meusTreinos.map(t => t.id === editingTreino.id ? { ...editingTreino, ...treinoData } : t));
            toast({ title: 'Treino atualizado com sucesso!', className: 'bg-accent text-accent-foreground' });
        } else {
            // Adiciona um novo treino
            const newTreino: Treino = {
                ...treinoData,
                id: `t-${Date.now()}`,
                alunoId: user!.uid,
                instrutorId: user!.uid, // O próprio aluno é o "instrutor"
            };
            setMeusTreinos([newTreino, ...meusTreinos]);
            toast({ title: 'Novo treino salvo com sucesso!', className: 'bg-accent text-accent-foreground' });
        }
        setIsFormVisible(false);
        setEditingTreino(null);
    };
    
    const handleEdit = (treino: Treino) => {
        setEditingTreino(treino);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleSetAtivo = (treinoId: string) => {
        const treinoSendoModificado = meusTreinos.find(t => t.id === treinoId);
        if (!treinoSendoModificado) return;

        const isActivating = !treinoSendoModificado.ativo;

        if (isActivating) {
            const tipoTreino = treinoSendoModificado.objetivo.split(' - ')[0];
            const outroAtivoDoMesmoTipo = meusTreinos.some(
                t => t.id !== treinoId && t.ativo && t.objetivo.startsWith(tipoTreino)
            );

            if (outroAtivoDoMesmoTipo) {
                toast({
                    title: 'Ação não permitida',
                    description: `Você já tem um treino "${tipoTreino}" ativo. Desative o antigo primeiro.`,
                    variant: 'destructive',
                });
                return;
            }
        }

        // Se for desativar, ou se for ativar e não houver conflito, prossegue
        setMeusTreinos(meusTreinos.map(t =>
            t.id === treinoId ? { ...t, ativo: !t.ativo } : t
        ));
        toast({ title: 'Status do treino atualizado!' });
    };
    
    const openDeleteAlert = (treino: Treino) => {
        setDeletingTreino(treino);
        setIsAlertOpen(true);
    };

    const handleDelete = () => {
        if (!deletingTreino) return;
        setMeusTreinos(meusTreinos.filter(t => t.id !== deletingTreino.id));
        toast({ title: 'Treino excluído!', variant: 'destructive' });
        setIsAlertOpen(false);
        setDeletingTreino(null);
    };

    const handleOpenNewForm = () => {
        setEditingTreino(null);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleGenerate = async (data: WorkoutGeneratorInput) => {
        setIsGenerating(true);
        setIsFormVisible(false);
        setEditingTreino(null);
        try {
            const result = await generateWorkoutPlan(data);
            
            const novosTreinos: Treino[] = result.workouts.map((workout, workoutIndex) => {
                 const novosExercicios = workout.exercicios.map((ex, index) => ({
                    id: `${Date.now()}-${workoutIndex}-${index}`,
                    nomeExercicio: ex.nomeExercicio,
                    series: ex.series,
                    repeticoes: ex.repeticoes,
                    observacoes: ex.observacoes,
                    descricao: flatExerciciosOptions.find(opt => opt.value === ex.nomeExercicio)?.label || ""
                }));

                return {
                    id: `t-${Date.now()}-${workoutIndex}`,
                    alunoId: user!.uid,
                    instrutorId: 'IA', // O "instrutor" é a IA
                    objetivo: workout.nome, // Ex: "Treino A - Peito e Triceps"
                    exercicios: novosExercicios as Exercicio[],
                    ativo: false, // Começam desativados por padrão
                    dataCriacao: new Date().toISOString()
                }
            });

            setMeusTreinos(prevTreinos => [...novosTreinos, ...prevTreinos]);
            
            toast({
                title: "Plano Semanal Gerado pela IA!",
                description: `${result.planName} foi criado com ${result.workouts.length} treinos. Veja abaixo.`,
                duration: 5000,
            });
        } catch (error) {
            console.error("Erro ao gerar treino com IA:", error);
            toast({ title: "Erro da IA", description: "Não foi possível gerar o plano. Tente novamente.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Meus Treinos"
                description="Crie, edite e gerencie seus planos de treino."
                actions={
                    !isFormVisible && (
                        <Button onClick={handleOpenNewForm}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Criar Treino Manual
                        </Button>
                    )
                }
            />
            
             <div className='mb-8'>
                <WorkoutGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>

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
            
            <Card>
                <CardHeader>
                    <CardTitle>Meus Planos Salvos</CardTitle>
                    <CardDescription>Ative os treinos que você fará durante a semana. Eles aparecerão no seu dashboard no dia correspondente.</CardDescription>
                </CardHeader>
                <CardContent className='grid gap-4'>
                    {meusTreinos.map(treino => (
                        <div key={treino.id} className={cn("rounded-lg border p-4 transition-all flex justify-between items-center", treino.ativo && "bg-accent/10 border-accent")}>
                           <div>
                                <div className='flex items-center gap-2'>
                                    <h3 className="font-bold text-base">{treino.objetivo}</h3>
                                    {treino.ativo && <Badge>Ativo</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {treino.exercicios.length} exercícios
                                </p>
                           </div>
                           <div className='flex items-center gap-2'>
                                <Button variant={treino.ativo ? "secondary" : "outline"} size="sm" onClick={() => handleSetAtivo(treino.id)}>
                                    <CheckCircle className='mr-2 h-4 w-4' />
                                    {treino.ativo ? 'Desativar' : 'Ativar'}
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => handleEdit(treino)}>
                                    <Pencil className='mr-2 h-4 w-4' />
                                    Editar
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => openDeleteAlert(treino)}>
                                    <Trash2 className='h-4 w-4' />
                                </Button>
                           </div>
                        </div>
                    ))}
                    {meusTreinos.length === 0 && (
                         <div className="text-center text-sm text-muted-foreground py-10">
                            Você ainda não criou nenhum treino. Use o gerador de IA ou crie um manualmente.
                         </div>
                    )}
                </CardContent>
            </Card>

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

    

    