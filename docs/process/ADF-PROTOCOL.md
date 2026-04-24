# ADF Protocol — Antigravity Debugging Framework (v1.0.0)

Este protocolo é obrigatório para o diagnóstico de erros monumentais de infraestrutura ou build que persistam por mais de 3 tentativas de correção manual.

## 1. Arqueologia Obrigatória (History-First)
Antes de qualquer modificação, o agente DEVE correlacionar o sintoma com o histórico recente.
- **Ação**: `git log -n 5 --name-only` e leitura de `.nanostack/journal/`.
- **Objetivo**: Identificar mudanças de "Paradigma de Versão" ou "Estrutura de Raiz".

## 2. Hierarquia de Sanidade (The Stack)
A depuração deve seguir esta ordem rigorosa de baixo para cima:
1.  **INFRA**: A raiz segue o padrão da versão atual do framework?
2.  **ESTÁTICA**: O `tsc --noEmit` está verde? (Não depure renderização com TSC quebrado).
3.  **ENGINE**: O build nativo completa com um layout minimalista?
4.  **UI**: O erro ocorre no componente específico ou no seu contexto (Providers)?

## 3. Reducionismo de Isolação
Se o build falhar na fase de renderização, o agente DEVE:
- Criar um `layout.tsx` minimalista: `<html><body>{children}</body></html>`.
- Se o erro persistir: O problema é **CONFIG/DEPENDÊNCIA**.
- Se o erro sumir: O problema é **LÓGICA/UI**.

## 4. Governança de Raiz (Next.js 15 Special)
- Proibido arquivos de instrumentação customizados (ex: `instrumentation-client.ts`).
- Sentry deve usar obrigatoriamente os 3 arquivos de config + `withSentryConfig`.
- Tags `<html>` e `<body>` são reservadas para arquivos de layout raiz ou erro global.

---
*Assinado: Antigravity Sentinel Core*
