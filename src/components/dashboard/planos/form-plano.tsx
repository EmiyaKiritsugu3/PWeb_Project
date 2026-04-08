'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Plano } from '@/lib/definitions';

const formSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  preco: z.coerce.number().min(0, 'O preço não pode ser negativo.'),
  duracaoDias: z.coerce.number().int().min(1, 'A duração deve ser de pelo menos 1 dia.'),
});

export type PlanoFormValues = z.infer<typeof formSchema>;

interface FormPlanoProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: PlanoFormValues) => void;
  plano?: Plano;
}

export function FormPlano({ isOpen, onOpenChange, onSubmit, plano }: FormPlanoProps) {
  const form = useForm<PlanoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: '', preco: 0, duracaoDias: 30 },
  });

  useEffect(() => {
    if (isOpen && plano) {
      form.reset({ nome: plano.nome, preco: plano.preco, duracaoDias: plano.duracaoDias });
    } else if (isOpen) {
      form.reset({ nome: '', preco: 0, duracaoDias: 30 });
    }
  }, [plano, isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{plano ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
          <DialogDescription>
            {plano ? 'Edite os dados do plano.' : 'Preencha os dados para criar um novo plano.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Plano</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Plano Mensal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="99.90" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duracaoDias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (dias)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{plano ? 'Salvar Alterações' : 'Criar Plano'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
