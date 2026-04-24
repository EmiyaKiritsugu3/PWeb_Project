'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Algo deu errado no sistema!</h2>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
