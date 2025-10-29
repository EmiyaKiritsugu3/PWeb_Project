
"use client";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANOS } from "@/lib/data"; // Usando dados estáticos
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function PlanosPage() {
  return (
    <>
      <PageHeader
        title="Planos da Academia"
        description="Visualize e gerencie os planos oferecidos."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Plano
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANOS.map((plano) => (
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
                <span className="text-sm font-normal text-muted-foreground">
                  /{" "}
                  {plano.duracaoDias === 30
                    ? "mês"
                    : `${Math.round(plano.duracaoDias / 30)} meses`}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Duração de {plano.duracaoDias} dias.
              </p>
            </CardContent>
          </Card>
        ))}

        {PLANOS?.length === 0 && (
          <Card className="md:col-span-4">
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum plano encontrado. Clique em "Adicionar Plano" para
              começar.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
