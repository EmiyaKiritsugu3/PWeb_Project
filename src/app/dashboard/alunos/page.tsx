import { getAlunos, getPlanos } from "@/lib/data";
import { AlunosClient } from "./alunos-client";

export default async function AlunosPage() {
  const [alunos, planos] = await Promise.all([
    getAlunos(),
    getPlanos(),
  ]);

  // Serializar datas para o cliente se necessário (Next.js lida bem com a maioria,
  // mas às vezes datas complexas precisam de atenção)
  const serializedAlunos = JSON.parse(JSON.stringify(alunos));
  const serializedPlanos = JSON.parse(JSON.stringify(planos));

  return (
    <AlunosClient 
      initialAlunos={serializedAlunos} 
      planos={serializedPlanos} 
    />
  );
}
