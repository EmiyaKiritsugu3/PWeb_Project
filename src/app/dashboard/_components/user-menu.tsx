'use client';

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
import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface UserMenuProps {
  displayName: string;
  email: string;
  photoURL: string;
}

export function UserMenu({ displayName, email, photoURL }: Readonly<UserMenuProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={photoURL} alt={displayName} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {email[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 glass-card mt-2" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="focus:bg-primary/20 focus:text-primary cursor-pointer">
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-primary/20 focus:text-primary cursor-pointer">
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild>
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair da conta</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
