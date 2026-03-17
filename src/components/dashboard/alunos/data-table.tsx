
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  Row,
  Cell,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Helper para encontrar a célula de ações para o card mobile
  const getActionsCell = (row: Row<TData>): Cell<TData, TValue> | undefined => {
    return row.getVisibleCells().find(cell => cell.column.id === 'actions');
  }

  return (
    <div>
      <div className="grid gap-4 md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-card/30 backdrop-blur-md border-primary/10">
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const actionsCell = getActionsCell(row);
            return (
              <Card key={row.id} className="bg-card/30 backdrop-blur-md border-primary/10 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(234,88,12,0.1)] transition-all duration-300">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar, Nome e Status */}
                    {row.getVisibleCells().map((cell) => {
                      const columnId = cell.column.id;
                      if (columnId === 'fotoUrl' || columnId === 'nomeCompleto' || columnId === 'statusMatricula') {
                        return <React.Fragment key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                               </React.Fragment>;
                      }
                      return null;
                    })}
                  </div>
                  {/* Ações */}
                  {actionsCell && flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="bg-card/30 backdrop-blur-md border-primary/10">
            <CardContent className="flex h-24 items-center justify-center p-6 text-center text-muted-foreground">
              Nenhum aluno encontrado.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop View: Tabela */}
      <div className="hidden rounded-xl border border-primary/10 bg-card/20 backdrop-blur-lg shadow-[0_0_20px_rgba(234,88,12,0.05)] md:block overflow-hidden">
        <Table>
          <TableHeader className="bg-card/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>
    </div>
  )
}
