"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Plano } from "@/lib/definitions";

function PlanoSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="grid gap-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

export default function PlanosPage() {
  const firestore = useFirestore();
  
  const planosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "planos"));
  }, [firestore]);

  const { data: planos, isLoading } = useCollection<Plano>(planosQuery);

  return (
    <>
      <PageHeader
        title="Planos da Academia"
        description="Visualize e gerencie os planos oferecidos."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <PlanoSkeleton key={i} />)}
        
        {!isLoading && planos && planos.map(plano => (
          <Card key={plano.id}>
            <CardHeader>
              <CardTitle>{plano.nome}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <p className="text-3xl font-bold">
                {plano.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                 <span className="text-sm font-normal text-muted-foreground">/ {plano.duracaoDias === 30 ? 'mês' : `${plano.duracaoDias / 30} meses`}</span>
              </p>
              <p className="text-sm text-muted-foreground">Duração de {plano.duracaoDias} dias.</p>
            </CardContent>
          </Card>
        ))}

        {!isLoading && planos?.length === 0 && (
          <Card className="md:col-span-4">
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum plano encontrado.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
