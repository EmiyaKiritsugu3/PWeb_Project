'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dumbbell, LogOut, User as UserIcon, Languages } from 'lucide-react';
import { useI18n } from '@/components/providers/i18n-provider';

export type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="touch-target h-11 w-11"
          aria-label={t('common.selectLanguage')}
        >
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('pt')}
          className={language === 'pt' ? 'bg-secondary' : ''}
        >
          Português (BR)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-secondary' : ''}
        >
          English (US)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu({
  displayName,
  photoURL,
  email,
  navLinks,
  onLogout,
}: Readonly<{
  displayName: string;
  photoURL: string;
  email?: string | null;
  navLinks: NavLink[];
  onLogout: () => void;
}>) {
  const { t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="touch-target relative h-11 w-11 rounded-full"
          aria-label="Perfil do usuario"
        >
          <Avatar>
            <AvatarImage src={photoURL} alt="Aluno" />
            <AvatarFallback>{email?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <p>{displayName}</p>
          <p className="text-xs font-normal text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <div className="md:hidden">
          <DropdownMenuSeparator />
          {navLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href}>
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>{t('common.profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('common.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AlunoHeader({
  pathname,
  navLinks,
  displayName,
  photoURL,
  email,
  onLogout,
}: Readonly<{
  pathname: string;
  navLinks: NavLink[];
  displayName: string;
  photoURL: string;
  email?: string | null;
  onLogout: () => void;
}>) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Dumbbell className="h-6 w-6 text-primary" />
        <span className="font-bold">Five Star Academy</span>
      </Link>
      <nav className="hidden md:flex items-center gap-2 ml-6">
        {navLinks.map((link) => (
          <Button key={link.href} variant={pathname === link.href ? 'secondary' : 'ghost'} asChild>
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </nav>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto">
        <LanguageSelector />
        <span className="hidden text-sm text-muted-foreground md:inline-block">
          {t('common.welcome')}, {displayName}!
        </span>
        <UserMenu
          displayName={displayName}
          photoURL={photoURL}
          email={email}
          navLinks={navLinks}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
