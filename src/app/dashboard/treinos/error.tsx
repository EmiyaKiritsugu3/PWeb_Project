'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Logger } from '@/lib/logger';

export default function TreinosError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    Logger.error('Erro na seção de Treinos:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Erro na Gestão de Treinos</CardTitle>
          </div>
          <CardDescription>
            Não foi possível carregar as ferramentas de treino no momento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Isso pode ser um problema temporário de conexão com a IA ou com o banco de dados.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => reset()} variant="outline" className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
