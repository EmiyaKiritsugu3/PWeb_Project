
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Aluno } from "@/lib/definitions";
import React, { useEffect } from "react";

const formSchema = z.object({
  nomeCompleto: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  email: z.string().email("Email inválido."),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido. Use o formato xxx.xxx.xxx-xx."),
  telefone: z.string().min(10, "Telefone inválido."),
  dataNascimento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data de nascimento inválida.",
  }),
  statusMatricula: z.enum(["ATIVA", "INADIMPLENTE", "INATIVA"]),
});

type FormValues = z.infer<typeof formSchema>;

interface FormAlunoProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: FormValues) => void;
  aluno?: Aluno;
}

export function FormAluno({ isOpen, onOpenChange, onSubmit, aluno }: FormAlunoProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeCompleto: "",
      email: "",
      cpf: "",
      telefone: "",
      dataNascimento: "",
      statusMatricula: "ATIVA",
    },
  });

  useEffect(() => {
    if (isOpen && aluno) {
      // Se a data de nascimento for um timestamp, converta para o formato YYYY-MM-DD
      const dataNascimentoFormatada = aluno.dataNascimento
        ? new Date(aluno.dataNascimento).toISOString().split('T')[0]
        : '';
      form.reset({
        ...aluno,
        dataNascimento: dataNascimentoFormatada,
      });
    } else if (isOpen) {
      form.reset({
        nomeCompleto: "",
        email: "",
        cpf: "",
        telefone: "",
        dataNascimento: "",
        statusMatricula: "ATIVA",
      });
    }
  }, [aluno, isOpen, form]);

  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{aluno ? "Editar Aluno" : "Cadastrar Novo Aluno"}</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para {aluno ? "editar os dados do" : "cadastrar um novo"} aluno.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="nomeCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: joao.silva@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="xxx.xxx.xxx-xx" 
                      {...field} 
                      onChange={(e) => field.onChange(formatCPF(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(xx) xxxxx-xxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="dataNascimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {aluno && (
              <FormField
                control={form.control}
                name="statusMatricula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status da Matrícula</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ATIVA">ATIVA</SelectItem>
                        <SelectItem value="INADIMPLENTE">INADIMPLENTE</SelectItem>
                        <SelectItem value="INATIVA">INATIVA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{aluno ? 'Salvar Alterações' : 'Cadastrar'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
