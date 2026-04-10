# Insights: CI E2E Pipeline — Debugging & Lições Aprendidas

**Data:** 2026-04-10
**Contexto:** Branch `004-elite-workflow-setup` — sete falhas encadeadas no pipeline CI E2E

---

## Por que estas notas existem

O pipeline E2E nunca havia rodado em CI antes desta branch. Ao tentar fazer o CI passar, descobrimos 7 falhas em sequência — cada uma escondida pela anterior. Este documento captura os insights técnicos para evitar que o próximo agente ou desenvolvedor passe pelas mesmas descobertas.

---

## Insight 1: Supabase CLI — `--output env` e o Problema das Aspas

### O que acontece

`supabase status --output env` retorna variáveis em formato de shell assignment, mas com valores entre aspas:

```
API URL=http://127.0.0.1:54321
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Por que isso quebra o JWT

Um JWT tem a forma `header.payload.signature`, todos em base64url. O caractere `"` (ASCII 34) não é válido em base64. Quando você faz `cut -d= -f2-` e não remove as aspas, o JWT começa com `"e` — e o decoder falha imediatamente no byte 0.

### O padrão correto de extração

```bash
STATUS_ENV=$(supabase status --output env 2>/dev/null || echo "")
ANON_KEY=$(echo "$STATUS_ENV" | grep "^ANON_KEY=" | cut -d= -f2- | sed "s/^[\"']//; s/[\"']$//")
```

O `sed "s/^[\"']//; s/[\"']$//"` remove aspas simples **ou** duplas do início e do fim — robusto para qualquer formatação futura da CLI.

### Fallback com chaves padrão

Quando o Supabase local usa `jwt_secret` padrão (`super-secret-jwt-token-with-at-least-32-characters-long`), os JWTs são determinísticos. Pode-se hardcodar o fallback com segurança:

```bash
if [ -z "$ANON_KEY" ]; then
  ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7W9odiD2okw387wrjgFjtl7gx5LwhwlM6ic"
fi
```

---

## Insight 2: Supabase Renomeou a Variável do Anon Key

### A mudança

| Versão antiga                   | Versão nova                                    |
| ------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` |

O Supabase renomeou "anonymous key" para "publishable default key" para refletir melhor o propósito (chave pública, segura para expor no frontend).

### Como detectar o problema

O sintoma é `Your project's URL and Key are required to create a Supabase client!` no servidor. Isso significa que `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` é `undefined`.

### O protocolo de verificação

Antes de definir env vars em CI ou `.env.*`, sempre verificar qual nome o código realmente lê:

```bash
grep -r "SUPABASE" src/ --include="*.ts" --include="*.tsx" | grep "process.env"
```

### Como o webserver Playwright recebe env vars

O Playwright inicia o webserver como processo filho via `webServer.command`. Esse processo herda `process.env` do processo Playwright. O processo Playwright herda do runner CI. A cadeia é:

```
GitHub Actions step env → processo npm e2e → dotenv-cli → processo playwright → processo next dev
```

Se uma variável não está na step env do CI, ela não chega ao webserver. E `NEXT_PUBLIC_*` em modo dev (`next dev`) são lidas de `process.env` em runtime — não são inlined como em `next build`.

---

## Insight 3: Prisma `migrate deploy` vs `db push`

### Dois workflows, dois comportamentos em CI

| Característica    | `migrate deploy`                            | `db push`                         |
| ----------------- | ------------------------------------------- | --------------------------------- |
| Requer            | Diretório `prisma/migrations/` com arquivos | Apenas `prisma/schema.prisma`     |
| Sem migrations    | No-op silencioso — sai com código 0         | N/A                               |
| Uso em CI         | Projetos com histórico de migrations        | Projetos em desenvolvimento ativo |
| Flag de segurança | Nenhuma                                     | `--accept-data-loss` necessário   |

### O bug silencioso

`prisma migrate deploy` com diretório de migrations vazio retorna:

```
No pending migrations to apply.
```

...com **código de saída 0** (sucesso). O CI não falha, mas as tabelas nunca são criadas. O seed então falha com erros de "tabela não existe".

### Como detectar qual workflow o projeto usa

```bash
ls prisma/
# Se migrations/ existe → usar migrate deploy
# Se migrations/ não existe → usar db push
```

---

## Insight 4: Playwright — Timeouts em Assertions vs Navegação

### O problema fundamental

O Playwright tem dois tipos de timeout:

| Tipo                                                   | Padrão | Configuração                         |
| ------------------------------------------------------ | ------ | ------------------------------------ |
| Timeout de navegação (`goto`, `waitForURL`)            | 30s    | `page.setDefaultNavigationTimeout()` |
| Timeout de assertion (`expect(locator).toBeVisible()`) | **5s** | `{ timeout: N }` por assertion       |

A maioria dos devs lembra de colocar timeout nas navegações, mas esquece das assertions.

### Por que 5s é insuficiente para SSR com Prisma

Fluxo do `/aluno/dashboard` antes de renderizar o `h1`:

```
1. Supabase auth.getUser() → rede para o Supabase local
2. prisma.aluno.findUnique() → query ao PostgreSQL
3. prisma.treino.findFirst() → segunda query ao PostgreSQL
4. Serialização + render do React Server Component
5. Envio do HTML ao browser + hidratação do client component
```

Em CI, cada passo pode levar 1-3s. O total pode facilmente passar de 5s.

### A regra prática

> **Use `{ timeout: 15_000 }` para qualquer assertion em elemento que depende de dados server-side.**

Elementos puramente estáticos (headings hardcoded no layout, nav, footer) podem usar o padrão de 5s. Elementos que dependem de fetch/query precisam de mais tempo.

### framer-motion e `toBeVisible()`

Um detalhe importante: `motion.div` com `initial={{ opacity: 0 }}` **não esconde** o elemento para o Playwright. `toBeVisible()` verifica se o elemento está no DOM, tem tamanho > 0 e não está oculto via `display: none` ou `visibility: hidden`. `opacity: 0` não conta como oculto. O problema era exclusivamente timing, não visibilidade CSS.

### Armadilha: Componentes UI que parecem headings mas não são

`getByRole('heading')` só encontra elementos semânticos: `<h1>`-`<h6>` ou elementos com `role="heading"`. Componentes como `CardTitle` do Shadcn UI **renderizam como `<div>`** — visualmente parecem títulos, mas o Playwright não os reconhece como headings.

**Diagnóstico**: Se `getByRole('heading')` retorna "element(s) not found" em uma página que exibe conteúdo, verificar se todos os estados da página (sucesso, erro, loading) têm headings semânticos.

---

## Insight 5: Monitorar CI Eficientemente

### O anti-padrão (caro em tokens e tempo)

```
# Polling manual a cada 15 segundos
gh run view <id>  # chamada 1
gh run view <id>  # chamada 2 (15s depois)
gh run view <id>  # chamada 3 (30s depois)
...               # dezenas de chamadas
```

Cada chamada consome tokens de contexto e não agrega informação nova enquanto o CI está rodando.

### O padrão correto

```bash
gh run watch <run-id>   # --run_in_background: true
# Aguardar notificação automática de conclusão
```

`gh run watch` bloqueia até o run terminar e exibe o resultado final. Usado em background, notifica automaticamente sem polling.

### Quando checar logs manualmente

Só após o run terminar **e falhar**:

```bash
gh run view --log --job=<job-id> 2>&1 | grep -A 30 "<step-name>"
```

---

## Insight 6: Debugging de CI Encadeado

### O padrão "cebola"

Em pipelines complexos, falhas são frequentemente encadeadas: o erro da camada 2 só aparece depois que o erro da camada 1 é corrigido. Exemplos desta sessão:

```
Camada 1: npm audit high severity → bloqueia todas as outras etapas
  ↓ corrigido
Camada 2: format check falha → sem ver a seed
  ↓ corrigido
Camada 3: seed falha por chave vazia → sem ver o erro de JWT
  ↓ corrigido
Camada 4: seed falha por tabelas faltando → outro problema na seed
  ↓ corrigido
Camada 5: JWT inválido por aspas → seed finalmente roda
  ↓ corrigido
Camada 6: webserver sem a env var certa → testes nem iniciam
  ↓ corrigido
Camada 7: timeout insuficiente → 1 teste falha
```

### Como acelerar o debugging

1. **Leia o log completo do step que falhou** — não apenas a primeira linha de erro
2. **Identifique exatamente qual comando falhou** — não assuma
3. **Reproduza localmente quando possível** — testa a fix antes de fazer push
4. **Use `echo` para debug em CI** — `echo "Value: ${#VAR}"` revela comprimento e confirma que a variável foi preenchida

---

## Insight 7: Imports Estáticos de Módulos Pesados em Client Components

### O problema

Um import estático no topo do arquivo é **resolvido e bundled na inicialização do módulo**, independente de quando a função que o usa é chamada. Se o módulo importado tem dependências que falham em bundling (ex: `@opentelemetry/exporter-jaeger` sem o ambiente correto), o erro ocorre quando o componente é carregado — antes de qualquer render.

```ts
// ❌ Erro de bundling acontece quando o componente é importado
import { generateWorkoutFeedback } from '@/ai/flows/workout-feedback-flow';

// ✅ Erro só ocorre (se ocorrer) quando o handler é chamado
const handleAction = async () => {
  const { generateWorkoutFeedback } = await import('@/ai/flows/workout-feedback-flow');
  // ...
};
```

### Quando usar import dinâmico

- Módulos usados apenas dentro de event handlers (botões, formulários)
- Módulos com dependências de telemetria/observabilidade (OpenTelemetry, Jaeger, etc.)
- Módulos pesados de AI/ML usados em ações pontuais
- Qualquer módulo que pode falhar em bundling sem quebrar o render inicial

### Diagnóstico em CI

Nos logs do webserver, erros de OpenTelemetry aparecem como:

```
Cannot find module '@opentelemetry/exporter-jaeger'
```

ou erros de "module not found" durante o startup do Next.js dev server. Se aparecerem repetidamente, um import estático está puxando o módulo problemático.

---

## Checklist para Novos Pipelines CI com E2E + Supabase

Antes de rodar pela primeira vez:

- [ ] `.prettierignore` inclui `docs/.obsidian/` e outros diretórios com código de terceiros
- [ ] `npm audit --audit-level=high` passa localmente
- [ ] Verificar se o projeto usa `migrate` ou `db push` — configurar o step correto
- [ ] Extrair chaves Supabase via `--output env` com strip de aspas + fallback
- [ ] Verificar qual nome de variável o código lê (grep `SUPABASE` em `src/`) — pode ser `PUBLISHABLE_DEFAULT_KEY`, não `ANON_KEY`
- [ ] Definir a variável correta no step de execução dos testes (não só no seed)
- [ ] Assertions em elementos SSR com dados: usar `{ timeout: 15_000 }`
- [ ] Verificar que **todos os estados** da página (sucesso, erro, empty) têm headings semânticos — componentes como `CardTitle` do Shadcn renderizam como `<div>`
- [ ] Imports de AI flows / módulos com deps de telemetria → usar dynamic import dentro de handlers
- [ ] Monitorar CI com `gh run watch` em background, não polling manual

---

## Relacionado

- [[dev-errors]] — ERR-011 a ERR-018: registro detalhado de cada falha
- [[2026-04-10-session-report]] — timeline completa da sessão
- [[ADR-001-professional-workflow-tooling]] — decisões de setup do workflow
