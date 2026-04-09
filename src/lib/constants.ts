/**
 * Routes restricted to GERENTE role only.
 * Referenced by middleware and DashboardNav — single source of truth.
 * Add new financial routes here; enforcement is automatic in both layers.
 */
export const FINANCIAL_ROUTES = ['/dashboard/financeiro', '/dashboard/planos'] as const;

export const DIAS_DA_SEMANA = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export const EXERCICIOS_POR_GRUPO = [
  {
    grupo: 'Peito',
    exercicios: [
      { nomeExercicio: 'Supino Reto com Barra', descricao: 'Deite-se em um banco reto...' },
      { nomeExercicio: 'Supino Reto com Halteres', descricao: 'Deite-se em um banco reto...' },
      {
        nomeExercicio: 'Supino Inclinado com Barra',
        descricao: 'Deite-se em um banco inclinado...',
      },
      {
        nomeExercicio: 'Supino Inclinado com Halteres',
        descricao: 'Deite-se em um banco inclinado...',
      },
      { nomeExercicio: 'Crucifixo Reto', descricao: 'Deite-se em um banco reto...' },
      { nomeExercicio: 'Crossover (Polia Média)', descricao: 'Posicione as polias...' },
      { nomeExercicio: 'Peck Deck (Voador)', descricao: 'Sente-se no aparelho...' },
    ],
  },
  {
    grupo: 'Costas',
    exercicios: [
      { nomeExercicio: 'Levantamento Terra', descricao: 'Com a barra no chão...' },
      { nomeExercicio: 'Puxada Frontal (Pulldown)', descricao: 'Sentado no pulley...' },
      { nomeExercicio: 'Remada Curvada com Barra', descricao: 'De pé, incline o tronco...' },
      {
        nomeExercicio: 'Remada Unilateral com Halter (Serrote)',
        descricao: 'Apoie um joelho e mão...',
      },
      { nomeExercicio: 'Remada Baixa Sentada', descricao: 'Sentado no cabo...' },
      { nomeExercicio: 'Barra Fixa (Pull-up)', descricao: 'Segure a barra fixa...' },
      { nomeExercicio: 'Lat Pulldown (Foco Costas)', descricao: 'Sentado no aparelho...' },
    ],
  },
  {
    grupo: 'Pernas (Quadríceps)',
    exercicios: [
      { nomeExercicio: 'Agachamento Livre com Barra', descricao: 'Com a barra nos trapézios...' },
      { nomeExercicio: 'Leg Press 45 Graus', descricao: 'Sentado no aparelho...' },
      { nomeExercicio: 'Cadeira Extensora', descricao: 'Sentado no aparelho...' },
      { nomeExercicio: 'Hack Squat', descricao: 'No aparelho de hack...' },
      { nomeExercicio: 'Agachamento Búlgaro', descricao: 'Com um pé apoiado atrás...' },
    ],
  },
  {
    grupo: 'Posteriores de Coxa',
    exercicios: [
      {
        nomeExercicio: 'Stiff com Barra/Halter',
        descricao: 'De pé, com pernas quase esticadas...',
      },
      { nomeExercicio: 'Mesa Flexora', descricao: 'Deitado no aparelho...' },
      { nomeExercicio: 'Cadeira Flexora', descricao: 'Sentado no aparelho...' },
      { nomeExercicio: 'Flexão de Pernas Unilateral (Em pé)', descricao: 'No aparelho...' },
    ],
  },
  {
    grupo: 'Glúteos',
    exercicios: [
      { nomeExercicio: 'Elevação Pélvica com Barra', descricao: 'Apoiado em um banco...' },
      { nomeExercicio: 'Abdução de Quadris (Máquina/Cabo)', descricao: 'Sentado ou em pé...' },
      { nomeExercicio: 'Glúteo Quatro Apoios (Cabo)', descricao: 'Na polia baixa...' },
    ],
  },
  {
    grupo: 'Ombros',
    exercicios: [
      { nomeExercicio: 'Desenvolvimento com Halteres', descricao: 'Sentado ou em pé...' },
      {
        nomeExercicio: 'Desenvolvimento com Barra (Military Press)',
        descricao: 'Em pé ou sentado...',
      },
      { nomeExercicio: 'Elevação Lateral com Halteres', descricao: 'De pé, braços ao lado...' },
      { nomeExercicio: 'Elevação Frontal com Halteres', descricao: 'De pé, braços à frente...' },
      {
        nomeExercicio: 'Crucifixo Inverso (Ombro Posterior)',
        descricao: 'Inclinado ou no Peck Deck...',
      },
      {
        nomeExercicio: 'Encolhimento de Ombros (Trapézio)',
        descricao: 'De pé, segurando halteres...',
      },
    ],
  },
  {
    grupo: 'Braços (Bíceps)',
    exercicios: [
      { nomeExercicio: 'Rosca Direta com Barra W', descricao: 'De pé, mãos em supinado...' },
      { nomeExercicio: 'Rosca Alternada com Halteres', descricao: 'De pé, girando os pulsos...' },
      { nomeExercicio: 'Rosca Martelo com Halteres', descricao: 'Pegada neutra...' },
      { nomeExercicio: 'Rosca Concentrada', descricao: 'Sentado, apoiando o cotovelo...' },
      { nomeExercicio: 'Rosca na Polia Baixa', descricao: 'Utilizando a barra reta/W...' },
    ],
  },
  {
    grupo: 'Braços (Tríceps)',
    exercicios: [
      { nomeExercicio: 'Tríceps Polia Alta (Corda/Barra)', descricao: 'Empurrando para baixo...' },
      { nomeExercicio: 'Tríceps Testa com Barra W', descricao: 'Deitado no banco...' },
      { nomeExercicio: 'Tríceps Francês com Halter', descricao: 'Atrás da cabeça...' },
      { nomeExercicio: 'Mergulho em Bancos (Dips)', descricao: 'Apoiado em dois bancos...' },
      { nomeExercicio: 'Supino Fechado', descricao: 'Com as mãos mais próximas...' },
    ],
  },
  {
    grupo: 'Panturrilhas',
    exercicios: [
      { nomeExercicio: 'Gêmeos em Pé (No Aparelho/Livre)', descricao: 'Elevando calcanhares...' },
      { nomeExercicio: 'Gêmeos Sentado (Cavalinho)', descricao: 'No aparelho sentado...' },
      { nomeExercicio: 'Gêmeos no Leg Press', descricao: 'Utilizando a ponta dos pés...' },
    ],
  },
  {
    grupo: 'Abdômen',
    exercicios: [
      { nomeExercicio: 'Abdominal Supra (Solo)', descricao: 'Deitado, elevando o tronco...' },
      {
        nomeExercicio: 'Abdominal Infra (Elevação de Pernas)',
        descricao: 'Deitado ou pendurado...',
      },
      { nomeExercicio: 'Plancha Abdominal (Core)', descricao: 'Apoio nos antebraços...' },
      { nomeExercicio: 'Abdominal Oblíquo', descricao: 'Cruzando cotovelo no joelho...' },
    ],
  },
];
