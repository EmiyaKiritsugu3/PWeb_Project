
"use client";

import { PageHeader } from "@/components/page-header";
import { useUser } from "@/firebase";

export default function AlunoDashboardPage() {
    const { user } = useUser();

    return (
        <>
            <PageHeader
                title={`Bem-vindo(a), ${user?.displayName || 'Aluno(a)'}!`}
                description="Aqui você pode acompanhar seu progresso e seus treinos."
            />
            <div className="grid gap-4">
                <p>Em breve, aqui você verá seu treino, matrícula e pagamentos.</p>
            </div>
        </>
    );
}
