"use client";

import { useState } from 'react';
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
import { PlusCircle, Save, Trash2 } from "lucide-react";
import type { Aluno, Exercicio } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Combobox } from '@/components/ui/combobox';

// Transforma os dados agrupados para o formato que o Combobox espera
const exerciciosOptions = EXERCICIOS_POR_GRUPO.map(grupo => ({
    label: grupo.grupo,
    options: grupo.exercicios.map(ex => ({
        value: ex.nomeExercicio,
        label: ex.nomeExercicio,
        keywords: [grupo.grupo], // Adiciona o nome do grupo como keyword
    }))
}));

// Cria uma lista plana para facilitar a busca do valor
const flatExerciciosOptions = EXERCICIOS_POR_GRUPO.flatMap(g => g.exercicios.map(ex => ({ 
    value: ex.nomeExercicio, 
    label: ex.nomeExercicio,
    imageUrl: ex.imageUrl,
    descricao: ex.descricao,
})));


export default function TreinosPage() {
    const firestore = useFirestore();
    const alunosCollection = useMemoFirebase(() => firestore ? collection(firestore, 'alunos') : null, [firestore]);
    const { data: alunos, isLoading: isLoadingAlunos } = useCollection<Aluno>(alunosCollection);

    const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
    const [objetivo, setObjetivo] = useState('');
    const [exercicios, setExercicios] = useState<Partial<Exercicio>[]>([]);
    const { toast } = useToast();

    const selectedAluno = alunos?.find(a => a.id === selectedAlunoId);

    const handleAddExercicio = () => {
        setExercicios([...exercicios, { id: `${Date.now()}`, nomeExercicio: '', series: 3, repeticoes: '10-12', observacoes: '' }]);
    };

    const handleRemoveExercicio = (id: string) => {
        setExercicios(exercicios.filter(ex => ex.id !== id));
    };

    const handleExercicioChange = (id: string, field: keyof Exercicio, value: string | number) => {
        setExercicios(exercicios.map(ex => {
            if (ex.id !== id) return ex;

            // Quando o nome do exercício muda, atualiza também a URL da imagem e a descrição
            if (field === 'nomeExercicio' && typeof value === 'string') {
                const selectedOption = flatExerciciosOptions.find(opt => opt.value === value);
                return { 
                    ...ex, 
                    nomeExercicio: value,
                    imageUrl: selectedOption?.imageUrl,
                    descricao: selectedOption?.descricao
                };
            }
            return { ...ex, [field]: value };
        }));
    };

    const handleSaveTreino = () => {
        if (!selectedAlunoId || !objetivo || exercicios.length === 0 || exercicios.some(e => !e.nomeExercicio)) {
            toast({
                title: "Erro ao salvar",
                description: "Preencha o aluno, objetivo e todos os exercícios antes de salvar.",
                variant: "destructive"
            });
            return;
        }
        
        toast({
            title: "Treino Salvo com Sucesso!",
            description: `O treino de ${objetivo} para ${selectedAluno?.nomeCompleto} foi salvo.`,
            className: 'bg-accent text-accent-foreground'
        })

        // Reset state
        setSelectedAlunoId(null);
        setObjetivo('');
        setExercicios([]);
    }

    return (
        <>
        <PageHeader
            title="Gestão de Treinos"
            description="Monte e gerencie as fichas de treino dos seus alunos."
        />

        <div className="grid gap-6">
            <Card>
            <CardHeader>
                <CardTitle>Selecionar Aluno</CardTitle>
                <CardDescription>Escolha um aluno para criar ou visualizar um treino.</CardDescription>
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
            <Card>
                <CardHeader>
                    <CardTitle>Novo Treino para {selectedAluno.nomeCompleto}</CardTitle>
                    <CardDescription>Defina o objetivo e adicione os exercícios abaixo.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className='grid gap-2'>
                        <Label htmlFor="objetivo">Objetivo do Treino</Label>
                        <Input id="objetivo" placeholder="Ex: Hipertrofia, Perda de Peso" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
                    </div>

                    <div className="grid gap-4">
                        <h3 className='font-medium'>Exercícios</h3>
                        {exercicios.map((exercicio, index) => (
                            <div key={exercicio.id} className="grid grid-cols-[1fr_auto_auto_1fr_auto] items-end gap-3 rounded-md border p-4">
                                <div className="grid gap-2">
                                     {index === 0 && <Label>Nome do Exercício</Label>}
                                     <Combobox 
                                        options={exerciciosOptions} 
                                        value={exercicio.nomeExercicio}
                                        onChange={(value) => handleExercicioChange(exercicio.id!, 'nomeExercicio', value)}
                                        placeholder='Selecione um exercício...'
                                        searchPlaceholder='Buscar exercício ou grupo...'
                                        notFoundMessage='Nenhum exercício encontrado.'
                                     />
                                </div>
                                <div className="grid gap-2">
                                     {index === 0 && <Label>Séries</Label>}
                                     <Input type="number" className='w-20' value={exercicio.series || ''} onChange={(e) => handleExercicioChange(exercicio.id!, 'series', parseInt(e.target.value))}/>
                                </div>
                                 <div className="grid gap-2">
                                     {index === 0 && <Label>Repetições</Label>}
                                     <Input placeholder="10-12" className='w-24' value={exercicio.repeticoes} onChange={(e) => handleExercicioChange(exercicio.id!, 'repeticoes', e.target.value)}/>
                                </div>
                                <div className="grid gap-2">
                                     {index === 0 && <Label>Observações</Label>}
                                     <Input placeholder="Opcional" value={exercicio.observacoes} onChange={(e) => handleExercicioChange(exercicio.id!, 'observacoes', e.target.value)}/>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveExercicio(exercicio.id!)} aria-label="Remover exercício">
                                    <Trash2 className='h-4 w-4 text-destructive'/>
                                </Button>
                            </div>
                        ))}
                         <Button variant="outline" onClick={handleAddExercicio}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Exercício
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveTreino} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Treino
                    </Button>
                </CardFooter>
            </Card>
            )}
        </div>
        </>
    );
}
