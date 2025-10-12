import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANOS } from "@/lib/data";

export default function PlanosPage() {
  return (
    <>
      <PageHeader
        title="Planos da Academia"
        description="Visualize e gerencie os planos oferecidos."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANOS.map(plano => (
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
      </div>
    </>
  );
}
