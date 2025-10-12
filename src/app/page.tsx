import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-gym');

  return (
    <div className="relative min-h-screen w-full">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center text-white">
        <main className="container mx-auto flex flex-col items-center justify-center space-y-6 px-4 py-12 md:py-24">
          <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            Academia Five Star
          </h1>
          <p className="max-w-3xl text-lg text-primary-foreground/80 md:text-xl">
            O sistema de gestão integrado para levar sua academia ao próximo
            nível. Gerencie alunos, treinos e finanças de forma eficiente e
            intuitiva.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Acessar Painel de Gestão</Link>
          </Button>
        </main>
      </div>
      <footer className="relative z-10 w-full py-4 text-center text-xs text-primary-foreground/60">
        <p>&copy; {new Date().getFullYear()} Five Star Gym. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
