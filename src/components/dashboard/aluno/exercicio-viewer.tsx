import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Exercicio } from '@/lib/definitions';

interface ExercicioViewerProps {
  exercicio: Exercicio | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExercicioViewer({
  exercicio,
  isOpen,
  onOpenChange,
}: Readonly<ExercicioViewerProps>) {
  if (!exercicio) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-card max-w-md border-cyan-500/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gradient-cyan text-2xl">
            {exercicio.nomeExercicio}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <ScrollArea className="max-h-80 w-full rounded-md pr-4">
          <div className="grid gap-4 py-4 text-sm text-foreground/80 leading-relaxed">
            {exercicio.descricao || 'Nenhuma descrição disponível para este exercício.'}
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/10">
            Fechar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
