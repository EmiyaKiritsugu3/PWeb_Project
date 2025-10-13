
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Aluno, Plano } from "@/lib/definitions";

interface FormMatriculaProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  aluno: Aluno | null;
  planos: Plano[];
  onSubmit: (aluno: Aluno, plano: Plano) => void;
}

export function FormMatricula({
  isOpen,
  onOpenChange,
  aluno,
  planos,
  onSubmit,
}: FormMatriculaProps) {
  const [selectedPlanoId, setSelectedPlanoId] = useState<string>("");

  useEffect(() => {
    // Resetar o plano selecionado quando o modal for aberto para um novo aluno
    if (isOpen) {
      setSelectedPlanoId("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!aluno || !selectedPlanoId) return;

    const planoSelecionado = planos.find((p) => p.id === selectedPlanoId);
    if (!planoSelecionado) return;

    onSubmit(aluno, planoSelecionado);
  };

  if (!aluno) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Matrícula</DialogTitle>
          <DialogDescription>
            Selecione um plano para matricular o aluno{" "}
            <span className="font-bold">{aluno.nomeCompleto}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="plano">Plano</Label>
            <Select value={selectedPlanoId} onValueChange={setSelectedPlanoId}>
              <SelectTrigger id="plano">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {planos.map((plano) => (
                  <SelectItem key={plano.id} value={plano.id}>
                    {plano.nome} -{" "}
                    {plano.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedPlanoId}>
            Confirmar Matrícula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
