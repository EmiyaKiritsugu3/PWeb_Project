import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, Sparkles } from 'lucide-react';

export function CardFeedback({
  feedback,
  isLoading,
}: Readonly<{
  feedback: { title: string; message: string } | null;
  isLoading: boolean;
}>) {
  if (isLoading) {
    return (
      <Card glass className="border-cyan-500/20 glow-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-cyan-400">
            <BrainCircuit className="h-6 w-6 animate-pulse" />
            <span className="headline">Pulsando Bio-Dados...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4 bg-white/5" />
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-2/3 bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  if (!feedback) return null;

  return (
    <Card
      glass
      className="border-cyan-500/40 shadow-cyan-500/10 animate-in fade-in zoom-in duration-500"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-cyan-400">
          <Sparkles className="h-6 w-6" />
          <span className="headline text-2xl">{feedback.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
          <p className="text-foreground/90 text-sm leading-relaxed italic">
            &ldquo;{feedback.message}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
