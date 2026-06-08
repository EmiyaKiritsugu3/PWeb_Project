'use client';

import * as React from 'react';
import type { ColumnDef, Row, Cell, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpDown } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchColumn?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  searchColumn = 'nomeCompleto',
  searchPlaceholder = 'Buscar por nome...',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const getActionsCell = (row: Row<TData>): Cell<TData, TValue> | undefined => {
    return row.getVisibleCells().find((cell) => cell.column.id === 'actions');
  };

  const searchValue = (table.getColumn(searchColumn)?.getFilterValue() as string) ?? '';

  const renderMobileCards = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        // sonar-ignore-next-line
        <Card key={`skeleton-${i}`} className="bg-card/30 backdrop-blur-md border-primary/10">
          <CardContent className="p-4">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ));
    }

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => {
        const actionsCell = getActionsCell(row);
        return (
          <Card
            key={row.id}
            className="bg-card/30 backdrop-blur-md border-primary/10 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(234,88,12,0.1)] transition-all duration-300"
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {row.getVisibleCells().map((cell) => {
                  const columnId = cell.column.id;
                  if (
                    columnId === 'fotoUrl' ||
                    columnId === 'nomeCompleto' ||
                    columnId === 'statusMatricula'
                  ) {
                    return (
                      <React.Fragment key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </React.Fragment>
                    );
                  }
                  return null;
                })}
              </div>
              {actionsCell &&
                flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
            </CardContent>
          </Card>
        );
      });
    }

    return (
      <Card className="bg-card/30 backdrop-blur-md border-primary/10">
        <CardContent className="flex h-24 items-center justify-center p-6 text-center text-muted-foreground">
          Nenhum aluno encontrado.
        </CardContent>
      </Card>
    );
  };

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        // sonar-ignore-next-line
        <TableRow key={`skeleton-row-${i}`}>
          {columns.map((_column, j) => (
            // sonar-ignore-next-line
            <TableCell key={`skeleton-col-${j}`}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          Nenhum aluno encontrado.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div>
      <div className="flex items-center pb-4">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => table.getColumn(searchColumn)?.setFilterValue(e.target.value)}
          className="max-w-sm bg-card/30 border-primary/20 focus:border-primary/60"
        />
      </div>

      <div className="grid gap-4 md:hidden">{renderMobileCards()}</div>

      <div className="hidden rounded-xl border border-primary/10 bg-card/20 backdrop-blur-lg shadow-[0_0_20px_rgba(234,88,12,0.05)] md:block overflow-hidden">
        <Table>
          <TableHeader className="bg-card/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 data-[state=open]:bg-accent"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>

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
  );
}
