# Story 1.1: Modernização do Layout do Dashboard Principal

## Descrição
Aplicar o design system **Premium Dark (OKLCH)**, validado na página de Login, para o Dashboard principal da Five Star. O objetivo é unificar a experiência visual com glassmorphism, neon glows e animações sutis de fundo, garantindo uma interface de "luxo" e alta performance.

## Contexto
- **PRD**: [02-features.md](file:///home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/docs/prd/02-features.md)
- **Arquitetura**: [01-system-design.md](file:///home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/docs/architecture/01-system-design.md)
- **Design System**: [design-system.css](file:///home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/app/design-system.css)

## Tarefas
- [ ] Adicionar elementos de fundo animados (`animate-glow-pulse`) ao Layout global do Dashboard.
- [ ] Refatorar os cartões de KPI no `page.tsx` para usar a classe `glass-card` e glows em OKLCH.
- [ ] Atualizar o componente `DashboardCharts` para usar gradientes e tooltips alinhados ao tema Premium Dark.
- [ ] Validar a responsividade e o contraste visual de todos os elementos modernizados.

## Critérios de Aceitação
- [ ] O Dashboard deve possuir a mesma identidade visual da página de Login (Premium Dark).
- [ ] O contraste de texto deve atender às normas de acessibilidade WCAG.
- [ ] As animações de fundo não devem interferir na legibilidade dos dados (KPIs e Gráficos).
- [ ] Build de produção sem erros de lint ou tipos.

## Arquivos Criados/Modificados
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/dashboard-charts.tsx`

## Notas
- Usar opacidade reduzida nos blobs de fundo (aprox. 5%) para manter o foco nos dados.
- Utilizar a paleta OKLCH para garantir cores vibrantes mas harmônicas.
