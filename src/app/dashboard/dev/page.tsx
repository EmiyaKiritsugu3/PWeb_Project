
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listModelsFlow } from '@/ai/flows/list-models-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DevPage() {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleListModels = async () => {
    setIsLoading(true);
    setModels([]);
    try {
      const availableModels = await listModelsFlow();
      setModels(availableModels);
      toast({ title: 'Sucesso!', description: 'Modelos listados com sucesso.' });
    } catch (error) {
      console.error('Erro ao listar modelos:', error);
      toast({
        title: 'Erro ao listar modelos',
        description: 'Não foi possível buscar a lista de modelos. Verifique o console.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Ferramentas de Desenvolvedor"
        description="Área para testes e depuração de funcionalidades internas."
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Listagem de Modelos de IA</CardTitle>
            <CardDescription>
              Clique no botão para consultar em tempo real os modelos de IA disponíveis através da API configurada no Genkit.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <Button onClick={handleListModels} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Listando...
                </>
              ) : (
                'Listar Modelos Disponíveis'
              )}
            </Button>
            {models.length > 0 && (
              <div className="w-full pt-4">
                <h3 className="font-semibold mb-2">Modelos Encontrados:</h3>
                 <ScrollArea className="h-72 w-full rounded-md border">
                    <pre className="p-4 text-sm">
                    {models.join('\n')}
                    </pre>
                 </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
