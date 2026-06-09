'use client';

import { useToast } from '@/hooks/use-toast';
import { Logger } from '@/lib/logger';

/**
 * useAppNotification
 *
 * Abstração centralizada para notificações da aplicação.
 * Desacopla a lógica de negócio do componente específico de UI (toast).
 */
export function useAppNotification() {
  const { toast } = useToast();

  const success = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  };

  const error = (title: string, description?: string, originalError?: unknown) => {
    if (originalError) {
      Logger.error(`[Notification] ${title}: ${description}`, originalError);
    }

    toast({
      title,
      description: description || 'Ocorreu um erro inesperado.',
      variant: 'destructive',
    });
  };

  // sonar-ignore-next-line
  const warn = success;

  return { success, error, warn };
}
