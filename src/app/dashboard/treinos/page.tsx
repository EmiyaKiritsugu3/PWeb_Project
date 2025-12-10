
"use client";

import { useState } from 'react';
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
import { EXERCICIOS_POR_GRUPO } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Trash2, Wand2, BrainCircuit } from "lucide-react";
import type { Aluno, Exercicio, Treino } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useUser, FirestorePermissionError, errorEmitter } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Combobox } from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  generateWorkoutPlan
} from "@/ai/flows/workout-generator-flow";
import {
    WorkoutGeneratorInputSchema,
    WorkoutGeneratorOutput,
    type WorkoutGeneratorInput,
} from "@/ai/schemas";

// Tipos para clareza
type WorkoutPlan = WorkoutGeneratorOutput;
type WorkoutExercise = WorkoutPlan['workouts'][0]['exercicios'][0];


// Transforma os dados agrupados para o formato que o Combobox espera
const exerciciosOptions = EXERCICIOS_POR_GRUPO.map(grupo => ({
    label: grupo.grupo,
    options: grupo.exercicios.map(ex => ({
        value: ex.nomeExercicio,
        label: ex.nomeExercicio,
        keywords: [grupo.grupo],
    }))
}));

const flatExerciciosOptions = EXERCICIOS_POR_GRUPO.flatMap(g => g.exercicios.map(ex => ({
    value: ex.nomeExercicio,
    label: ex.nomeExercicio,
    description: ex.descricao
})));

// Componente do Gerador de Treino com IA
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
                    Preencha os dados do aluno para que a IA crie uma divisão de treinos completa para a semana.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form id="ai-generator-form" onSubmit={form.handleSubmit(onGenerate)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    <FormLabel>Nível de Experiência</FormLabel>
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
                         <div className='sm:col-span-2 lg:col-span-1'>
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


// NOVO COMPONENTE PARA EDIÇÃO DO PLANO GERADO
function PlanoGeradoParaEdicao({ 
    plano, 
    aluno,
    onSave,
    onCancel 
}: { 
    plano: WorkoutPlan; 
    aluno: Aluno;
    onSave: (planoEditado: WorkoutPlan) => Promise<void>;
    onCancel: () => void;
}) {
    const [planoEditado, setPlanoEditado] = useState(plano);

    const handleExercicioChange = (treinoIndex: number, exIndex: number, field: keyof WorkoutExercise, value: string | number) => {
        const novoPlano = { ...planoEditado };
        const exercicio = novoPlano.workouts[treinoIndex].exercicios[exIndex];
        
        if (field === 'series') {
            exercicio[field] = typeof value === 'string' ? parseInt(value, 10) || 0 : value;
        } else if (field === 'nomeExercicio' || field === 'repeticoes' || field === 'observacoes' || field === 'grupoMuscular') {
             exercicio[field] = String(value);
        }

        setPlanoEditado(novoPlano);
    };
    
    const handleNomeTreinoChange = (treinoIndex: number, nome: string) => {
        const novoPlano = { ...planoEditado };
        novoPlano.workouts[treinoIndex].nome = nome;
        setPlanoEditado(novoPlano);
    };

    return (
        <Card className="border-primary">
            <CardHeader>
                <CardTitle>Passo 3: Revisar e Editar o Plano para {aluno.nomeCompleto}</CardTitle>
                <CardDescription>Ajuste os exercícios, séries, repetições e nomes dos treinos gerados pela IA antes de salvar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Nome do Plano</Label>
                    <Input 
                        value={planoEditado.planName} 
                        onChange={(e) => setPlanoEditado({ ...planoEditado, planName: e.target.value })}
                    />
                </div>

                {planoEditado.workouts.map((treino, treinoIndex) => (
                    <div key={treinoIndex} className="border p-4 rounded-md space-y-4">
                        <div className="space-y-2">
                            <Label>Nome do Treino</Label>
                            <Input 
                                value={treino.nome}
                                onChange={(e) => handleNomeTreinoChange(treinoIndex, e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-4">
                        {treino.exercicios.map((exercicio, exIndex) => (
                             <div key={exIndex} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr] items-end gap-3">
                                <div className="grid gap-2">
                                     <Label>Exercício</Label>
                                     <Input value={exercicio.nomeExercicio} onChange={(e) => handleExercicioChange(treinoIndex, exIndex, 'nomeExercicio', e.target.value)} />
                                 </div>
                                 <div className="grid gap-2">
                                     <Label>Séries</Label>
                                     <Input type="number" className="w-20" value={exercicio.series} onChange={(e) => handleExercicioChange(treinoIndex, exIndex, 'series', e.target.value)} />
                                 </div>
                                 <div className="grid gap-2">
                                     <Label>Reps</Label>
                                     <Input className="w-24" value={exercicio.repeticoes} onChange={(e) => handleExercicioChange(treinoIndex, exIndex, 'repeticoes', e.target.value)} />
                                 </div>
                                 <div className="grid gap-2">
                                     <Label>Observações</Label>
                                     <Input value={exercicio.observacoes} onChange={(e) => handleExercicioChange(treinoIndex, exIndex, 'observacoes', e.target.value)} />
                                 </div>
                             </div>
                        ))}
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
                <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button onClick={() => onSave(planoEditado)}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Plano e Atribuir ao Aluno
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function TreinosPage() {
    const firestore = useFirestore();
    const { user: FUser } = useUser();
    
    const alunosCollection = useMemoFirebase(() => 
        firestore ? collection(firestore, 'alunos') : null, 
    [firestore]);

    const { data: alunos, isLoading: isLoadingAlunos } = useCollection<Aluno>(alunosCollection);

    const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
    const [objetivo, setObjetivo] = useState('');
    const [exercicios, setExercicios] = useState<Partial<Exercicio>[]>([]);
    const { toast } = useToast();
    
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [planoGerado, setPlanoGerado] = useState<WorkoutPlan | null>(null);

    const selectedAluno = alunos?.find(a => a.id === selectedAlunoId);

    const handleAddExercicio = () => {
        setExercicios([...exercicios, { id: `${Date.now()}`, nomeExercicio: '', series: 3, repeticoes: '10-12', observacoes: '', descricao: '' }]);
    };

    const handleRemoveExercicio = (id: string) => {
        setExercicios(exercicios.filter(ex => ex.id !== id));
    };

    const handleExercicioChange = (id: string, field: keyof Exercicio, value: string | number) => {
        setExercicios(exercicios.map(ex => {
            if (ex.id !== id) return ex;

            if (field === 'nomeExercicio' && typeof value === 'string') {
                const selectedOption = flatExerciciosOptions.find(opt => opt.value === value);
                return { 
                    ...ex, 
                    nomeExercicio: value,
                    descricao: selectedOption?.description || ""
                };
            }
            return { ...ex, [field]: value };
        }));
    };

    const handleSaveTreino = async () => {
        if (!selectedAlunoId || !objetivo || exercicios.length === 0 || exercicios.some(e => !e.nomeExercicio) || !firestore || !FUser) {
            toast({
                title: "Erro ao salvar",
                description: "Selecione o aluno, defina um objetivo e adicione exercícios.",
                variant: "destructive"
            });
            return;
        }

        const treinosCollectionRef = collection(firestore, 'alunos', selectedAlunoId, 'treinos');
        const novoTreino: Omit<Treino, 'id'> = {
            alunoId: selectedAlunoId,
            instrutorId: FUser.uid,
            objetivo,
            exercicios: exercicios as Exercicio[],
            diaSemana: null,
            dataCriacao: new Date().toISOString()
        };

        try {
            await addDoc(treinosCollectionRef, novoTreino);
            toast({
                title: "Treino Salvo com Sucesso!",
                description: `O treino de ${objetivo} para ${selectedAluno?.nomeCompleto} foi salvo.`,
                className: 'bg-accent text-accent-foreground'
            });
            setObjetivo('');
            setExercicios([]);
        } catch (error: unknown) {
            console.error("Erro ao salvar treino:", error);
            if (error instanceof FirestorePermissionError) {
                 errorEmitter.emit('permission-error', error);
            } else {
               toast({ title: "Erro no Firestore", description: "Não foi possível salvar o treino.", variant: "destructive" });
            }
        }
    }
    
    const handleGenerateWorkout = async (data: WorkoutGeneratorInput) => {
        if (!selectedAluno) {
            toast({ title: "Selecione um aluno primeiro!", variant: "destructive" });
            return;
        }
        
        setIsGenerating(true);
        setPlanoGerado(null);
        try {
            const result = await generateWorkoutPlan(data);
            setPlanoGerado(result);
            toast({
                title: "Plano Gerado com Sucesso!",
                description: "Revise e edite o plano abaixo antes de salvar.",
            });
        } catch (error) {
            console.error("Erro ao gerar treino com IA:", error);
            toast({
                title: "Erro da IA",
                description: "Não foi possível gerar o plano. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSavePlanoGerado = async (planoEditado: WorkoutPlan) => {
        if (!selectedAluno || !firestore || !FUser) return;
        
        const treinosCollectionRef = collection(firestore, 'alunos', selectedAluno.id, 'treinos');
        
        try {
            for (const workout of planoEditado.workouts) {
                 const novosExercicios = workout.exercicios.map((ex: WorkoutExercise, index: number) => {
                    const exercicioBase = flatExerciciosOptions.find(opt => opt.value === ex.nomeExercicio);
                    return {
                        id: `${Date.now()}-${index}`,
                        nomeExercicio: ex.nomeExercicio,
                        series: ex.series,
                        repeticoes: ex.repeticoes,
                        observacoes: ex.observacoes,
                        descricao: exercicioBase?.description || ""
                    };
                });

                const novoTreino: Omit<Treino, 'id'> = {
                    alunoId: selectedAluno.id,
                    instrutorId: FUser.uid,
                    objetivo: workout.nome,
                    exercicios: novosExercicios,
                    diaSemana: workout.diaSugerido,
                    dataCriacao: new Date().toISOString(),
                };
                
                await addDoc(treinosCollectionRef, novoTreino);
            }

            toast({
                title: "Plano Salvo e Atribuído!",
                description: `${planoEditado.planName} foi salvo para ${selectedAluno.nomeCompleto}.`,
                className: 'bg-accent text-accent-foreground'
            });
            
            setPlanoGerado(null);

        } catch (error) {
            console.error("Erro ao salvar plano gerado:", error);
            toast({ title: "Erro ao Salvar", description: "Não foi possível salvar o plano.", variant: "destructive" });
        }
    };


    return (
        <>
        <PageHeader
            title="Gestão de Treinos"
            description="Monte treinos manualmente ou use a IA para gerar sugestões."
        />

        <div className="grid gap-6">
            <Card>
            <CardHeader>
                <CardTitle>Passo 1: Selecionar Aluno</CardTitle>
            </CardHeader>
            <CardContent>
                <Select onValueChange={setSelectedAlunoId} value={selectedAlunoId || ''} disabled={isLoadingAlunos}>
                <SelectTrigger className="w-full md:w-1/2">
                    <SelectValue placeholder={isLoadingAlunos ? "Carregando alunos..." : "Selecione um aluno..."} />
                </SelectTrigger>
                <SelectContent>
                    {!isLoadingAlunos && alunos?.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                        {aluno.nomeCompleto}
                    </SelectItem>
                    ))}
                     {!isLoadingAlunos && alunos?.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">Nenhum aluno cadastrado.</div>
                    )}
                </SelectContent>
                </Select>
            </CardContent>
            </Card>

            {selectedAluno && (
                <>
                    <WorkoutGenerator onGenerate={handleGenerateWorkout} isGenerating={isGenerating}/>
                    
                    {planoGerado && (
                        <PlanoGeradoParaEdicao 
                            plano={planoGerado}
                            aluno={selectedAluno}
                            onSave={handleSavePlanoGerado}
                            onCancel={() => setPlanoGerado(null)}
                        />
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Passo 2: Criar Treino Manual para {selectedAluno.nomeCompleto}</CardTitle>
                            <CardDescription>Adicione exercícios manualmente. Para gerar um plano completo, use o gerador de IA acima.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className='grid gap-2'>
                                <Label htmlFor="objetivo">Nome/Objetivo do Treino</Label>
                                <Input id="objetivo" placeholder="Ex: Treino A - Peito e Tríceps" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
                            </div>

                            <div className="grid gap-4">
                                <h3 className='font-medium'>Exercícios</h3>
                                {exercicios.map((exercicio, index) => (
                                    <div key={exercicio.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto_1fr_auto] items-end gap-3 rounded-md border p-4">
                                        <div className="grid gap-2 sm:col-span-2 md:col-span-1">
                                            {index === 0 && <Label className='md:hidden'>Exercício</Label>}
                                            <Combobox 
                                                options={exerciciosOptions} 
                                                flatOptions={flatExerciciosOptions}
                                                value={exercicio.nomeExercicio}
                                                onChange={(value) => handleExercicioChange(exercicio.id!, 'nomeExercicio', value)}
                                                placeholder='Selecione um exercício...'
                                                searchPlaceholder='Buscar exercício ou grupo...'
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
                                        <div className="grid gap-2 sm:col-span-2 md:col-span-1">
                                            {index === 0 && <Label className='md:hidden'>Obs</Label>}
                                            <Input placeholder="Opcional" value={exercicio.observacoes || ''} onChange={(e) => handleExercicioChange(exercicio.id!, 'observacoes', e.target.value)}/>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveExercicio(exercicio.id!)} aria-label="Remover exercício" className='sm:col-start-2 md:col-start-auto justify-self-end'>
                                            <Trash2 className='h-4 w-4 text-destructive'/>
                                        </Button>
                                    </div>
                                ))}
                                {exercicios.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground py-4">
                                        Nenhum exercício adicionado. Use o gerador de IA ou adicione manually.
                                    </div>
                                )}
                                <Button variant="outline" onClick={handleAddExercicio}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Adicionar Exercício Manualmente
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveTreino} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={exercicios.length === 0}>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar este Treino Manual
                            </Button>
                        </CardFooter>
                    </Card>
                </>
            )}
        </div>
        </>
    );
}
