import { getUser } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import OnboardingClient from './onboarding-client';

export default async function OnboardingPage() {
  const { user, error } = await getUser();
  if (error || !user) redirect('/aluno/login');

  // Idempotent: if a row already exists, onboarding was completed (or is in
  // flight via another tab) — skip the form and go straight to the dashboard.
  const existing = await prisma.aluno.findUnique({
    where: { email: user.email },
    select: { id: true },
  });
  if (existing) redirect('/aluno/dashboard');

  return <OnboardingClient />;
}
