
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const [imageUrl, setImageUrl] = useState("https://picsum.photos/seed/gym-hero/1920/1080");

  useEffect(() => {
    // This runs only on the client, after hydration, preventing a mismatch
    const randomId = Math.floor(Math.random() * 1000);
    setImageUrl(`https://picsum.photos/id/${randomId}/1920/1080`);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative flex h-[60vh] items-center justify-center text-center text-white md:h-[70vh]">
        <Image
            src={imageUrl}
            alt="A modern gym with various workout equipment"
            fill
            className="object-cover"
            priority
            data-ai-hint="modern gym"
            key={imageUrl} // Add key to force re-render on URL change
          />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center space-y-4 px-4">
          <Dumbbell className="h-16 w-16 text-primary" />
          <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            Academia Five Star
          </h1>
          <p className="max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
            Alcance seu potencial máximo.
          </p>
        </div>
      </section>

      {/* Content and Login Section */}
      <section className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Um sistema de gestão completo
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
                O sistema de gestão integrado para levar sua academia ao próximo nível. Gerencie alunos, treinos e finanças de forma eficiente e intuitiva.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className='w-full sm:w-auto'>
                <Link href="/login">Acessar Painel de Gestão</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className='w-full sm:w-auto'>
                <Link href="/aluno/login">Portal do Aluno</Link>
                </Button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Five Star Gym. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
