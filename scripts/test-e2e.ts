import { prisma } from '../src/lib/prisma';
import { createAlunoAction, createMatriculaAction, finalizarTreinoAction } from '../src/lib/actions/alunos';
import { getPlanos } from '../src/lib/data';

async function runTest() {
  console.log('--- Starting E2E Flow Test ---');
  
  try {
    // 1. Get a Plano
    const planos = await getPlanos();
    if (planos.length === 0) {
      console.log('No planos found, skipping test or need to seed.');
      return;
    }
    const plano = planos[0];
    
    const email = `test.e2e.${Date.now()}@example.com`;
    // 2. Create Aluno
    console.log(`1. Criando Aluno com email: ${email}`);
    const alunoResult = await createAlunoAction({
      nomeCompleto: 'Aluno Teste E2E',
      email: email,
      dataNascimento: '1990-01-01',
      telefone: '11999999999',
      genero: 'M'
    });
    
    if (!alunoResult.success) {
      throw new Error(`Failed to create Aluno: ${alunoResult.error}`);
    }
    const alunoId = alunoResult.data.id;
    console.log(`   Aluno criado com sucesso. ID: ${alunoId}`);
    
    // Check initial level
    const initialAluno = await prisma.aluno.findUnique({ where: { id: alunoId } });
    console.log(`   XP Inicial: ${initialAluno?.xp}, Nível: ${initialAluno?.nivel}`);

    // 3. Matricular Aluno
    console.log(`2. Matriculando Aluno no plano: ${plano.nome}`);
    const matriculaResult = await createMatriculaAction(alunoId, plano.id);
    if (!matriculaResult.success) {
      throw new Error(`Failed to create matricula: ${matriculaResult.error}`);
    }
    console.log(`   Matrícula criada com sucesso.`);

    // 4. Executar um treino (simulando finalizarTreinoAction)
    console.log(`3. Finalizando um Treino para ganhar XP...`);
    // Passar valores para a action
    const treinoResult = await finalizarTreinoAction(alunoId, 'Treino E2E de Teste', '30 min', 500); // 500 calorias = 500 XP
    if (!treinoResult.success) {
      throw new Error(`Failed to finalize treino: ${treinoResult.error}`);
    }
    console.log(`   Treino finalizado com sucesso. XP Ganhos: ${treinoResult.data.xpGains}, Streak: ${treinoResult.data.newStreak}`);
    
    // 5. Verificar estado do Aluno atualizado
    const finalAluno = await prisma.aluno.findUnique({ where: { id: alunoId } });
    console.log(`4. Verificando estado final do Aluno...`);
    console.log(`   XP Atual: ${finalAluno?.xp}, Nível: ${finalAluno?.nivel}, Streak: ${finalAluno?.streak}`);
    
    // Cleanup
    console.log(`5. Limpando dados do teste...`);
    await prisma.matricula.deleteMany({ where: { alunoId } });
    await prisma.historicoTreino.deleteMany({ where: { alunoId } });
    await prisma.aluno.delete({ where: { id: alunoId } });
    console.log(`   Limpeza concluída.`);
    
    console.log('--- E2E Test SUCCESS ---');
  } catch (error) {
    console.error('--- E2E Test FAILED ---');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
