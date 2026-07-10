import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { Role } from '@/lib/definitions';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  await requireRole(Role.GERENTE);

  return (
    <div className="space-y-6 pb-20">
      <PageHeader title="Perfil" description="Gerencie seus dados de acesso e identidade." />
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-primary" />
            Em construção
          </CardTitle>
          <CardDescription>
            Esta seção disponibilizará edição de nome, e-mail e foto do gerente.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Em breve.</CardContent>
      </Card>
    </div>
  );
}
