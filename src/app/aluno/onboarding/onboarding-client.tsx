'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAppNotification } from '@/hooks/use-app-notification';
import { completeOnboardingAction } from '@/lib/actions/onboarding';

// Client-side mirror of OnboardingBaseSchema (definitions.ts). Kept local so
// the form module does not pull the server-side definitions file into the
// browser bundle. The server action re-validates with the canonical schema.
const formSchema = z.object({
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF inválido. Use o formato xxx.xxx.xxx-xx.',
  }),
  telefone: z.string().min(10, { message: 'Telefone inválido.' }),
  dataNascimento: z.string().refine((val) => !Number.isNaN(Date.parse(val)) && val !== '', {
    message: 'Data de nascimento inválida.',
  }),
  cep: z.string().regex(/^\d{5}-\d{3}$/, { message: 'CEP inválido. Use o formato xxxxx-xxx.' }),
  endereco: z.string().min(3, { message: 'Endereço inválido.' }),
  numero: z.string().min(1, { message: 'Número é obrigatório.' }),
  bairro: z.string().min(2, { message: 'Bairro inválido.' }),
  cidade: z.string().min(2, { message: 'Cidade inválida.' }),
  estado: z.string().regex(/^[A-Z]{2}$/, { message: 'UF inválida (2 letras).' }),
});

type FormValues = z.infer<typeof formSchema>;

const formatCPF = (value: string) =>
  value
    .replaceAll(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .substring(0, 14);

const formatCEP = (value: string) =>
  value
    .replaceAll(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);

const formatPhone = (value: string) =>
  value
    .replaceAll(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15);

export default function OnboardingClient() {
  const notify = useAppNotification();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cpf: '',
      telefone: '',
      dataNascimento: '',
      cep: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  });

  // ViaCEP lookup: on valid-format CEP, fetch and fill endereco/bairro/cidade/
  // estado. User can still edit prefilled fields. On failure, leave fields
  // empty (fallback: user types manually) — don't block the form.
  const handleCepBlur = async (rawCep: string) => {
    const digits = rawCep.replaceAll(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await res.json()) as {
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
        erro?: string | boolean;
      };
      if (!data.erro) {
        if (data.logradouro) form.setValue('endereco', data.logradouro, { shouldValidate: true });
        if (data.bairro) form.setValue('bairro', data.bairro, { shouldValidate: true });
        if (data.localidade) form.setValue('cidade', data.localidade, { shouldValidate: true });
        if (data.uf) form.setValue('estado', data.uf, { shouldValidate: true });
      }
    } catch {
      // Network / parse failure — silent, user fills manually (fallback).
    } finally {
      setCepLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await completeOnboardingAction(values);
      if (result.success) {
        notify.success('Perfil criado!', 'Bem-vindo ao portal do aluno.');
        router.push('/aluno/dashboard');
      } else {
        notify.error('Erro ao salvar', result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <Card className="z-10 w-full max-w-md glass-card glow-cyan border-white/10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            <span className="text-gradient-cyan">Complete seu cadastro</span>
          </CardTitle>
          <CardDescription className="text-balance pt-2">
            Precisamos de alguns dados para ativar seu perfil de aluno.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="xxx.xxx.xxx-xx"
                        inputMode="numeric"
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
                      <Input
                        placeholder="(xx) xxxxx-xxxx"
                        inputMode="numeric"
                        {...field}
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      />
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
              <div className="grid grid-cols-[1fr_1fr] gap-3">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="xxxxx-xxx"
                          inputMode="numeric"
                          {...field}
                          onChange={(e) => field.onChange(formatCEP(e.target.value))}
                          onBlur={(e) => {
                            field.onBlur();
                            void handleCepBlur(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {cepLoading && (
                        <p className="text-xs text-muted-foreground">Buscando endereço…</p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SP"
                          maxLength={2}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase().substring(0, 2))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua / Avenida" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Nº" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting || cepLoading}
              >
                {isSubmitting ? 'Salvando…' : 'Finalizar cadastro'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
