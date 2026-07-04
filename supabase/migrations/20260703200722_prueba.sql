drop extension if exists "pg_net";

create type "public"."MetodoPagamento" as enum ('PIX', 'DINHEIRO', 'CARTAO');

create type "public"."Role" as enum ('GERENTE', 'RECEPCIONISTA', 'INSTRUTOR');

create type "public"."StatusAluno" as enum ('ATIVA', 'INADIMPLENTE', 'INATIVA');

create type "public"."StatusMatricula" as enum ('ATIVA', 'VENCIDA');


  create table "public"."_prisma_migrations" (
    "id" character varying(36) not null,
    "checksum" character varying(64) not null,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) not null,
    "logs" text,
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone not null default now(),
    "applied_steps_count" integer not null default 0
      );



  create table "public"."alunos" (
    "id" text not null default gen_random_uuid(),
    "nomeCompleto" text not null,
    "cpf" text not null,
    "email" text not null,
    "telefone" text,
    "dataNascimento" timestamp(3) without time zone,
    "dataCadastro" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "fotoUrl" text,
    "biometriaHash" text,
    "statusMatricula" public."StatusAluno" not null default 'ATIVA'::public."StatusAluno",
    "nivel" integer not null default 1,
    "exp" integer not null default 0,
    "streakDiasSeguidos" integer not null default 0,
    "treinosNoMes" integer not null default 0,
    "ultimoTreinoData" timestamp(3) without time zone
      );


alter table "public"."alunos" enable row level security;


  create table "public"."exercicios" (
    "id" text not null default gen_random_uuid(),
    "treinoId" text not null,
    "nomeExercicio" text not null,
    "series" integer not null,
    "repeticoes" text not null,
    "observacoes" text,
    "descricao" text
      );


alter table "public"."exercicios" enable row level security;


  create table "public"."funcionarios" (
    "id" text not null default gen_random_uuid(),
    "nomeCompleto" text not null,
    "email" text not null,
    "role" public."Role" not null default 'RECEPCIONISTA'::public."Role"
      );


alter table "public"."funcionarios" enable row level security;


  create table "public"."historico_treinos" (
    "id" text not null default gen_random_uuid(),
    "alunoId" text not null,
    "treinoId" text not null,
    "dataExecucao" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "duracaoMinutos" integer not null
      );


alter table "public"."historico_treinos" enable row level security;


  create table "public"."matriculas" (
    "id" text not null default gen_random_uuid(),
    "alunoId" text not null,
    "planoId" text not null,
    "dataInicio" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "dataVencimento" timestamp(3) without time zone not null,
    "status" public."StatusMatricula" not null default 'ATIVA'::public."StatusMatricula"
      );


alter table "public"."matriculas" enable row level security;


  create table "public"."pagamentos" (
    "id" text not null default gen_random_uuid(),
    "matriculaId" text not null,
    "alunoId" text not null,
    "valor" double precision not null,
    "dataPagamento" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "metodo" public."MetodoPagamento" not null
      );


alter table "public"."pagamentos" enable row level security;


  create table "public"."planos" (
    "id" text not null default gen_random_uuid(),
    "nome" text not null,
    "preco" double precision not null,
    "duracaoDias" integer not null
      );


alter table "public"."planos" enable row level security;


  create table "public"."series_executadas" (
    "id" text not null default gen_random_uuid(),
    "historicoTreinoId" text not null,
    "exercicioId" text not null,
    "nomeExercicio" text not null,
    "serieNumero" integer not null,
    "peso" double precision,
    "repeticoesFeitas" integer,
    "concluido" boolean not null default false
      );


alter table "public"."series_executadas" enable row level security;


  create table "public"."treinos" (
    "id" text not null default gen_random_uuid(),
    "alunoId" text not null,
    "instrutorId" text,
    "objetivo" text not null,
    "dataCriacao" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "diaSemana" integer
      );


alter table "public"."treinos" enable row level security;

CREATE UNIQUE INDEX _prisma_migrations_pkey ON public._prisma_migrations USING btree (id);

CREATE UNIQUE INDEX "alunos_biometriaHash_key" ON public.alunos USING btree ("biometriaHash");

CREATE UNIQUE INDEX alunos_cpf_key ON public.alunos USING btree (cpf);

CREATE UNIQUE INDEX alunos_email_key ON public.alunos USING btree (email);

CREATE UNIQUE INDEX alunos_pkey ON public.alunos USING btree (id);

CREATE UNIQUE INDEX exercicios_pkey ON public.exercicios USING btree (id);

CREATE UNIQUE INDEX funcionarios_email_key ON public.funcionarios USING btree (email);

CREATE UNIQUE INDEX funcionarios_pkey ON public.funcionarios USING btree (id);

CREATE INDEX "historico_treinos_alunoId_dataExecucao_idx" ON public.historico_treinos USING btree ("alunoId", "dataExecucao");

CREATE UNIQUE INDEX historico_treinos_pkey ON public.historico_treinos USING btree (id);

CREATE INDEX "matriculas_alunoId_idx" ON public.matriculas USING btree ("alunoId");

CREATE UNIQUE INDEX matriculas_pkey ON public.matriculas USING btree (id);

CREATE INDEX matriculas_status_idx ON public.matriculas USING btree (status);

CREATE INDEX "pagamentos_alunoId_idx" ON public.pagamentos USING btree ("alunoId");

CREATE INDEX "pagamentos_dataPagamento_idx" ON public.pagamentos USING btree ("dataPagamento");

CREATE UNIQUE INDEX pagamentos_pkey ON public.pagamentos USING btree (id);

CREATE UNIQUE INDEX planos_pkey ON public.planos USING btree (id);

CREATE INDEX "series_executadas_historicoTreinoId_idx" ON public.series_executadas USING btree ("historicoTreinoId");

CREATE UNIQUE INDEX series_executadas_pkey ON public.series_executadas USING btree (id);

CREATE INDEX "treinos_alunoId_idx" ON public.treinos USING btree ("alunoId");

CREATE UNIQUE INDEX treinos_pkey ON public.treinos USING btree (id);

alter table "public"."_prisma_migrations" add constraint "_prisma_migrations_pkey" PRIMARY KEY using index "_prisma_migrations_pkey";

alter table "public"."alunos" add constraint "alunos_pkey" PRIMARY KEY using index "alunos_pkey";

alter table "public"."exercicios" add constraint "exercicios_pkey" PRIMARY KEY using index "exercicios_pkey";

alter table "public"."funcionarios" add constraint "funcionarios_pkey" PRIMARY KEY using index "funcionarios_pkey";

alter table "public"."historico_treinos" add constraint "historico_treinos_pkey" PRIMARY KEY using index "historico_treinos_pkey";

alter table "public"."matriculas" add constraint "matriculas_pkey" PRIMARY KEY using index "matriculas_pkey";

alter table "public"."pagamentos" add constraint "pagamentos_pkey" PRIMARY KEY using index "pagamentos_pkey";

alter table "public"."planos" add constraint "planos_pkey" PRIMARY KEY using index "planos_pkey";

alter table "public"."series_executadas" add constraint "series_executadas_pkey" PRIMARY KEY using index "series_executadas_pkey";

alter table "public"."treinos" add constraint "treinos_pkey" PRIMARY KEY using index "treinos_pkey";

alter table "public"."exercicios" add constraint "exercicios_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES public.treinos(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."exercicios" validate constraint "exercicios_treinoId_fkey";

alter table "public"."historico_treinos" add constraint "historico_treinos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES public.alunos(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."historico_treinos" validate constraint "historico_treinos_alunoId_fkey";

alter table "public"."historico_treinos" add constraint "historico_treinos_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES public.treinos(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."historico_treinos" validate constraint "historico_treinos_treinoId_fkey";

alter table "public"."matriculas" add constraint "matriculas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES public.alunos(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."matriculas" validate constraint "matriculas_alunoId_fkey";

alter table "public"."matriculas" add constraint "matriculas_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES public.planos(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."matriculas" validate constraint "matriculas_planoId_fkey";

alter table "public"."pagamentos" add constraint "pagamentos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES public.alunos(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."pagamentos" validate constraint "pagamentos_alunoId_fkey";

alter table "public"."pagamentos" add constraint "pagamentos_matriculaId_fkey" FOREIGN KEY ("matriculaId") REFERENCES public.matriculas(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."pagamentos" validate constraint "pagamentos_matriculaId_fkey";

alter table "public"."series_executadas" add constraint "series_executadas_historicoTreinoId_fkey" FOREIGN KEY ("historicoTreinoId") REFERENCES public.historico_treinos(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."series_executadas" validate constraint "series_executadas_historicoTreinoId_fkey";

alter table "public"."treinos" add constraint "treinos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES public.alunos(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."treinos" validate constraint "treinos_alunoId_fkey";

alter table "public"."treinos" add constraint "treinos_instrutorId_fkey" FOREIGN KEY ("instrutorId") REFERENCES public.funcionarios(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."treinos" validate constraint "treinos_instrutorId_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_funcionario()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.funcionarios
    WHERE id = auth.uid()::text
  );
END;
$function$
;

grant select on table "public"."_prisma_migrations" to "authenticated";

grant select on table "public"."alunos" to "authenticated";

grant select on table "public"."exercicios" to "authenticated";

grant select on table "public"."funcionarios" to "authenticated";

grant select on table "public"."historico_treinos" to "authenticated";

grant select on table "public"."matriculas" to "authenticated";

grant select on table "public"."pagamentos" to "authenticated";

grant select on table "public"."planos" to "authenticated";

grant select on table "public"."series_executadas" to "authenticated";

grant select on table "public"."treinos" to "authenticated";


  create policy "Alunos veem apenas seu perfil"
  on "public"."alunos"
  as permissive
  for select
  to authenticated
using (((auth.uid())::text = id));



  create policy "Alunos: editar próprio perfil ou ser funcionário"
  on "public"."alunos"
  as permissive
  for update
  to authenticated
using ((((auth.uid())::text = id) OR public.is_funcionario()));



  create policy "Alunos: ver próprio perfil ou ser funcionário"
  on "public"."alunos"
  as permissive
  for select
  to authenticated
using ((((auth.uid())::text = id) OR public.is_funcionario()));



  create policy "Funcionários leem todos os alunos"
  on "public"."alunos"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.funcionarios
  WHERE (funcionarios.id = (auth.uid())::text))));



  create policy "Alunos veem seus exercicios"
  on "public"."exercicios"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.treinos
  WHERE ((treinos.id = exercicios."treinoId") AND (treinos."alunoId" = (auth.uid())::text)))));



  create policy "Funcionários visíveis para autenticados"
  on "public"."funcionarios"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Alunos veem seus pagamentos"
  on "public"."pagamentos"
  as permissive
  for select
  to authenticated
using (((auth.uid())::text = "alunoId"));



  create policy "Planos visíveis para todos logados"
  on "public"."planos"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Alunos veem apenas seus treinos"
  on "public"."treinos"
  as permissive
  for select
  to authenticated
using (((auth.uid())::text = "alunoId"));



  create policy "Funcionários gerenciam treinos"
  on "public"."treinos"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.funcionarios
  WHERE (funcionarios.id = (auth.uid())::text))));



  create policy "Treinos: gerenciar treinos (apenas funcionários)"
  on "public"."treinos"
  as permissive
  for all
  to authenticated
using (public.is_funcionario());



  create policy "Treinos: ver próprios treinos ou ser funcionário"
  on "public"."treinos"
  as permissive
  for select
  to authenticated
using ((((auth.uid())::text = "alunoId") OR public.is_funcionario()));



