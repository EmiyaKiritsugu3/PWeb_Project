import { listAvailableModels } from '../src/ai/flows/list-models-flow';

async function main() {
  console.log('--- Listando Modelos Genkit ---');
  try {
    const models = await listAvailableModels();
    if (models.length === 0) {
      console.log('Nenhum modelo encontrado no registro.');
    } else {
      console.log('Modelos Disponíveis:');
      models.forEach((m) => console.log(` - ${m}`));
    }
  } catch (error) {
    console.error('Erro ao listar modelos:', error);
  }
}

main();
