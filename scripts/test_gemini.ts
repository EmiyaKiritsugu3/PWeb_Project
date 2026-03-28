import { ai } from '../src/ai/genkit';

async function main() {
    console.log('--- Testando Conexão Gemini ---');
    try {
        console.log('Realizando chamada simples de teste...');
        const response = await ai.generate({
            model: 'googleai/gemini-2.0-flash',
            prompt: 'Diga "Olá, Sistema PWeb está funcionando!" em uma palavra.'
        });
        
        console.log('--- Resposta da IA ---');
        console.log(response.text);
        console.log('--- Sucesso! ---');
    } catch (error) {
        console.error('--- ERRO DE CONEXÃO ---');
        console.error(error);
        console.log('\nVerifique se o seu GEMINI_API_KEY ou GOOGLE_GENAI_API_KEY está correto no .env.');
    }
}

main();
