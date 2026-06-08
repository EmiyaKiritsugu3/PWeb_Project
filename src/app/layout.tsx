import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import React from 'react';
import { SupabaseAuthProvider } from '@/components/providers/auth-provider';

export const metadata: Metadata = {
  title: 'Five Star Gym Manager',
  description: 'Integrated Management System for Academia Five Star',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="font-body antialiased selection:bg-primary/20 selection:text-primary">
        <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
