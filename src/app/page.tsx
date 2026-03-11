
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  // Define a static, server-rendered placeholder to prevent layout shift.
  const initialImageUrl = "https://picsum.photos/seed/gym-hero/1920/1080";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      {/* Hero Section */}
      <section className="relative flex min-h-[75vh] items-center justify-center text-center text-white md:min-h-[85vh]">
        <Image
            src="/images/hero_gym_dark.png"
            alt="Academia Five Star - Interior moderno e de alta performance"
            fill
            className="object-cover"
            priority
          />
        {/* Gradient Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/40" />
        
        <div className="relative z-10 flex flex-col items-center space-y-6 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="rounded-full bg-primary/20 p-4 backdrop-blur-sm border border-primary/30">
             <Dumbbell className="h-12 w-12 text-primary md:h-16 md:w-16 drop-shadow-[0_0_15px_rgba(255,102,0,0.8)]" />
          </div>
          <h1 className="font-headline text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl drop-shadow-lg">
            Academia <span className="text-primary">Five Star</span>
          </h1>
          <p className="max-w-2xl text-lg text-gray-300 md:text-2xl font-light tracking-wide">
            O ambiente definitivo para alcançar seu potencial máximo. Gestão inteligente, treinos com IA.
          </p>
        </div>
      </section>

      {/* Content and Login Section */}
      <section className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 md:py-24 relative -mt-10 z-20">
        <div className="w-full max-w-4xl rounded-3xl bg-card border border-white/5 p-8 md:p-12 shadow-2xl backdrop-blur-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-300">
                Uma Nova Era de Gestão
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Trazemos inteligência artificial e tecnologia de ponta para a sua jornada. 
                Gerencie alunos, receba treinos inteligentes e eleve seus resultados de forma estruturada.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
                <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold shadow-[0_0_20px_rgba(255,102,0,0.3)] hover:shadow-[0_0_30px_rgba(255,102,0,0.6)] transition-all">
                <Link href="/login">Acessar Painel</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold border-primary/50 text-foreground hover:bg-primary/10 transition-all">
                <Link href="/aluno/login">Portal do Aluno</Link>
                </Button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full pb-8 pt-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Five Star Gym System. Powered by Next.js & Genkit.</p>
      </footer>
    </div>
  );
}
