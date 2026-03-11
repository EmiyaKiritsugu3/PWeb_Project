
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Aluno } from "@/lib/definitions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from 'date-fns';

const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const getStatusVariant = (status: Aluno["statusMatricula"]): "default" | "destructive" | "secondary" => {
    switch (status) {
        case "ATIVA":
            return "default"
        case "INADIMPLENTE":
            return "destructive"
        case "INATIVA":
            return "secondary"
    }
}

interface ColumnsProps {
    onEdit: (aluno: Aluno) => void;
    onDelete: (aluno: Aluno) => void;
    onNewMatricula: (aluno: Aluno) => void;
}

export const columns = ({ onEdit, onDelete, onNewMatricula }: ColumnsProps): ColumnDef<Aluno>[] => [
  {
    accessorKey: "fotoUrl",
    header: "",
    cell: ({ row }) => {
        const aluno = row.original;
        return (
            <Avatar className="h-12 w-12">
                <AvatarImage src={aluno.fotoUrl} alt={aluno.nomeCompleto} />
                <AvatarFallback>{getInitials(aluno.nomeCompleto)}</AvatarFallback>
            </Avatar>
        )
    }
  },
  {
    accessorKey: "nomeCompleto",
    header: "Nome",
    cell: ({ row }) => {
        const nome = row.getValue("nomeCompleto") as string;
        const email = row.original.email;
        return (
            <div className="grid gap-0.5 md:hidden">
                <p className="font-medium">{nome}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
            </div>
        )
    }
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="hidden md:block">{row.original.email}</div>
  },
  {
    accessorKey: "dataCadastro",
    header: "Data de Cadastro",
    cell: ({ row }) => {
        const date = row.getValue("dataCadastro") as string;
        if (!date) return null;
        try {
            return format(new Date(date), 'dd/MM/yyyy');
        } catch {
            return date;
        }
    }
  },
  {
    accessorKey: "statusMatricula",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("statusMatricula") as Aluno["statusMatricula"];
        return <Badge variant={getStatusVariant(status)} className="text-xs">{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const aluno = row.original;
      const { toast } = useToast();
 
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onNewMatricula(aluno)}>
                Nova Matrícula
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(aluno)}>
                Editar Aluno
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (aluno.id) {
                    navigator.clipboard.writeText(aluno.id);
                    toast({ title: "ID copiado!", description: "O ID do aluno foi copiado para a área de transferência." });
                  }
                }}
              >
                Copiar ID do aluno
              </DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => onDelete(aluno)}
               >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
