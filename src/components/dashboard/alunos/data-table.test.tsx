import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable } from './data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';

type MockChildren = { children?: ReactNode };

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: MockChildren) => <table>{children}</table>,
  TableBody: ({ children }: MockChildren) => <tbody>{children}</tbody>,
  TableCell: ({ children }: MockChildren) => <td>{children}</td>,
  TableHead: ({ children }: MockChildren) => <th>{children}</th>,
  TableHeader: ({ children }: MockChildren) => <thead>{children}</thead>,
  TableRow: ({ children, ...props }: MockChildren & Record<string, unknown>) => (
    <tr {...props}>{children}</tr>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    ...props
  }: MockChildren & { onClick?: () => void; disabled?: boolean; variant?: string }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <input data-testid="search-input" value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: MockChildren) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: MockChildren) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  ArrowUpDown: () => <span data-testid="arrow-icon" />,
}));

const mockGetRowModel = vi.fn();
const mockGetHeaderGroups = vi.fn();
const mockGetColumn = vi.fn();
const mockGetCanPreviousPage = vi.fn(() => false);
const mockGetCanNextPage = vi.fn(() => false);
const mockNextPage = vi.fn();
const mockPreviousPage = vi.fn();

vi.mock('@tanstack/react-table', async () => {
  const actual = await vi.importActual('@tanstack/react-table');
  return {
    ...actual,
    useReactTable: () => ({
      getRowModel: mockGetRowModel,
      getHeaderGroups: mockGetHeaderGroups,
      getColumn: mockGetColumn,
      getCanPreviousPage: mockGetCanPreviousPage,
      getCanNextPage: mockGetCanNextPage,
      nextPage: mockNextPage,
      previousPage: mockPreviousPage,
    }),
    flexRender: (def: unknown, ctx: unknown) => {
      if (typeof def === 'function') {
        return def(ctx);
      }
      if (ctx && typeof ctx === 'object' && 'getValue' in (ctx as Record<string, unknown>)) {
        const getValue = (ctx as { getValue: () => unknown }).getValue;
        return String(getValue());
      }
      return String(def ?? '');
    },
    getCoreRowModel: () => () => ({}),
    getPaginationRowModel: () => () => ({}),
    getSortedRowModel: () => () => ({}),
    getFilteredRowModel: () => () => ({}),
  };
});

const columns: ColumnDef<{ id: string; name: string; email: string }>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

const mockData = [
  { id: '1', name: 'Alice', email: 'alice@test.com' },
  { id: '2', name: 'Bob', email: 'bob@test.com' },
];

describe('DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without throwing', () => {
    mockGetRowModel.mockReturnValue({ rows: [] });
    mockGetHeaderGroups.mockReturnValue([{ id: '1', headers: [] }]);
    mockGetColumn.mockReturnValue({ getFilterValue: () => '' });

    const { container } = render(<DataTable columns={columns} data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('renders search input with default placeholder', () => {
    mockGetRowModel.mockReturnValue({ rows: [] });
    mockGetHeaderGroups.mockReturnValue([{ id: '1', headers: [] }]);
    mockGetColumn.mockReturnValue({ getFilterValue: () => '' });

    render(<DataTable columns={columns} data={mockData} />);
    expect(screen.getByPlaceholderText('Buscar por nome...')).toBeTruthy();
  });

  it('renders custom search placeholder', () => {
    mockGetRowModel.mockReturnValue({ rows: [] });
    mockGetHeaderGroups.mockReturnValue([{ id: '1', headers: [] }]);
    mockGetColumn.mockReturnValue({ getFilterValue: () => '' });

    render(
      <DataTable
        columns={columns}
        data={mockData}
        searchPlaceholder="Custom search..."
        searchColumn="email"
      />
    );
    expect(screen.getByPlaceholderText('Custom search...')).toBeTruthy();
  });

  it('shows empty state when no rows', () => {
    mockGetRowModel.mockReturnValue({ rows: [] });
    mockGetHeaderGroups.mockReturnValue([{ id: '1', headers: [] }]);
    mockGetColumn.mockReturnValue({ getFilterValue: () => '' });

    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getAllByText('Nenhum aluno encontrado.').length).toBeGreaterThanOrEqual(1);
  });

  it('renders table rows when data is present', () => {
    mockGetRowModel.mockReturnValue({
      rows: mockData.map((item) => ({
        id: item.id,
        original: item,
        getIsSelected: () => false,
        getVisibleCells: () => [
          {
            id: `${item.id}-name`,
            column: { id: 'name', columnDef: { cell: () => item.name } },
            getContext: () => ({ getValue: () => item.name }),
          },
          {
            id: `${item.id}-email`,
            column: { id: 'email', columnDef: { cell: () => item.email } },
            getContext: () => ({ getValue: () => item.email }),
          },
        ],
      })),
    });
    mockGetHeaderGroups.mockReturnValue([
      {
        id: '1',
        headers: [
          {
            id: 'name',
            column: {
              getCanSort: () => true,
              getToggleSortingHandler: () => {},
              columnDef: { header: () => 'Name' },
            },
            columnDef: { header: () => 'Name' },
            getContext: () => ({}),
            isPlaceholder: false,
          },
          {
            id: 'email',
            column: {
              getCanSort: () => false,
              getToggleSortingHandler: () => {},
              columnDef: { header: () => 'Email' },
            },
            columnDef: { header: () => 'Email' },
            getContext: () => ({}),
            isPlaceholder: false,
          },
        ],
      },
    ]);
    mockGetColumn.mockReturnValue({ getFilterValue: () => '' });

    render(<DataTable columns={columns} data={mockData} />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('shows loading skeletons when isLoading is true', () => {
    mockGetRowModel.mockReturnValue({ rows: [] });
    mockGetHeaderGroups.mockReturnValue([{ id: '1', headers: [] }]);
    mockGetColumn.mockReturnValue({ getFilterValue: () => '' });

    render(<DataTable columns={columns} data={[]} isLoading />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders pagination buttons', () => {
    mockGetRowModel.mockReturnValue({ rows: [] });
    mockGetHeaderGroups.mockReturnValue([{ id: '1', headers: [] }]);
    mockGetColumn.mockReturnValue({ getFilterValue: () => '' });

    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('Anterior')).toBeTruthy();
    expect(screen.getByText('Próximo')).toBeTruthy();
  });

  it('pagination buttons are disabled when no pages', () => {
    mockGetRowModel.mockReturnValue({ rows: [] });
    mockGetHeaderGroups.mockReturnValue([{ id: '1', headers: [] }]);
    mockGetColumn.mockReturnValue({ getFilterValue: () => '' });

    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('Anterior').closest('button')?.disabled).toBe(true);
    expect(screen.getByText('Próximo').closest('button')?.disabled).toBe(true);
  });
});
