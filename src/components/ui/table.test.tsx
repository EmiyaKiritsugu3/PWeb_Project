import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

describe('Table components', () => {
  it('Table renders a <table> inside a wrapper div', () => {
    const { container } = render(
      <Table data-testid="table">
        <tbody />
      </Table>
    );
    expect(container.querySelector('table')).toBeTruthy();
  });

  it('TableHeader renders <thead>', () => {
    render(
      <Table>
        <TableHeader data-testid="thead">
          <tr />
        </TableHeader>
      </Table>
    );
    expect(screen.getByTestId('thead').tagName).toBe('THEAD');
  });

  it('TableBody renders <tbody>', () => {
    render(
      <Table>
        <TableBody data-testid="tbody">
          <tr />
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId('tbody').tagName).toBe('TBODY');
  });

  it('TableFooter renders <tfoot>', () => {
    render(
      <Table>
        <TableFooter data-testid="tfoot">
          <tr />
        </TableFooter>
      </Table>
    );
    expect(screen.getByTestId('tfoot').tagName).toBe('TFOOT');
  });

  it('TableHead renders <th>', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="th">Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByTestId('th').tagName).toBe('TH');
    expect(screen.getByText('Name')).toBeTruthy();
  });

  it('TableRow renders <tr>', () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="tr" />
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId('tr').tagName).toBe('TR');
  });

  it('TableCell renders <td>', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="td">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId('td').tagName).toBe('TD');
    expect(screen.getByText('Cell')).toBeTruthy();
  });

  it('TableCaption renders <caption>', () => {
    render(
      <Table>
        <TableCaption data-testid="caption">Table info</TableCaption>
      </Table>
    );
    expect(screen.getByTestId('caption').tagName).toBe('CAPTION');
    expect(screen.getByText('Table info')).toBeTruthy();
  });

  it('Table passes custom className', () => {
    const { container } = render(
      <Table className="custom-table">
        <tbody />
      </Table>
    );
    expect(container.querySelector('table')!.className).toContain('custom-table');
  });
});
