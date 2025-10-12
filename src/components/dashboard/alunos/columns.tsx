"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Aluno } from "@/lib/definitions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Aluno>[] => [
  {
    accessorKey: "fotoUrl",
    header: "",
    cell: ({ row }) => {
        const aluno = row.original;
        return (
            <Avatar>
                <AvatarImage src={aluno.fotoUrl} alt={aluno.nomeCompleto} />
                <AvatarFallback>{getInitials(aluno.nomeCompleto)}</AvatarFallback>
            </Avatar>
        )
    }
  },
  {
    accessorKey: "nomeCompleto",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "statusMatricula",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("statusMatricula") as Aluno["statusMatricula"];
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>
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
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(aluno.id);
                  toast({ title: "ID copiado!", description: "O ID do aluno foi copiado para a área de transferência." });
                }}
              >
                Copiar ID do aluno
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(aluno)}>
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(aluno)}>
                Editar
              </DropdownMenuItem>
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
