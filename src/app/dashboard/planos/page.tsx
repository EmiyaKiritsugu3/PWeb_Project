
"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Plano } from "@/lib/definitions";

// Componente para o formulário de criação de plano
function FormPlano({ isOpen, onOpenChange, onSubmit }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSubmit: (data: Omit<Plano, 'id'>) => void }) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState(0);
  const [duracaoDias, setDuracaoDias] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nome, preco, duracaoDias });
    onOpenChange(false);
    // Resetar campos
    setNome('');
    setPreco(0);
    setDuracaoDias(30);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Plano</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do novo plano que será oferecido na academia.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome do Plano</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Plano Anual" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input id="preco" type="number" value={preco} onChange={(e) => setPreco(parseFloat(e.target.value))} placeholder="120.00" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duracao">Duração (dias)</Label>
            <Input id="duracao" type="number" value={duracaoDias} onChange={(e) => setDuracaoDias(parseInt(e.target.value))} placeholder="30" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar Plano
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function PlanoSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="grid gap-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

export default function PlanosPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const planosRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "planos");
  }, [firestore]);

  const { data: planos, isLoading } = useCollection<Plano>(planosRef);

  const handleAddPlano = async (data: Omit<Plano, 'id'>) => {
    if (!planosRef) return;

    try {
      await addDoc(planosRef, data);
      toast({
        title: "Plano adicionado!",
        description: `O plano "${data.nome}" foi criado com sucesso.`,
        className: "bg-accent text-accent-foreground",
      });
    } catch (error) {
      console.error("Erro ao adicionar plano: ", error);
      toast({
        title: "Erro ao criar plano",
        description: "Não foi possível salvar o plano. Tente novamente.",
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <PageHeader
        title="Planos da Academia"
        description="Visualize e gerencie os planos oferecidos."
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Plano
          </Button>
        }
      />

      <FormPlano 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddPlano}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <PlanoSkeleton key={i} />)}
        
        {!isLoading && planos && planos.map(plano => (
          <Card key={plano.id}>
            <CardHeader>
              <CardTitle>{plano.nome}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <p className="text-3xl font-bold">
                {plano.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                 <span className="text-sm font-normal text-muted-foreground">/ {plano.duracaoDias === 30 ? 'mês' : `${Math.round(plano.duracaoDias / 30)} meses`}</span>
              </p>
              <p className="text-sm text-muted-foreground">Duração de {plano.duracaoDias} dias.</p>
            </CardContent>
          </Card>
        ))}

        {!isLoading && planos?.length === 0 && (
          <Card className="md:col-span-4">
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum plano encontrado. Clique em "Adicionar Plano" para começar.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
