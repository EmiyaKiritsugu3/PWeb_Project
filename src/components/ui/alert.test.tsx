import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert components', () => {
  it('renders Alert with role="alert"', () => {
    render(<Alert data-testid="alert">Alert content</Alert>);
    const el = screen.getByTestId('alert');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('alert');
  });

  it('renders with default variant class', () => {
    render(<Alert data-testid="alert">Content</Alert>);
    expect(screen.getByTestId('alert').className).toContain('bg-background');
  });

  it('renders with destructive variant class', () => {
    render(
      <Alert variant="destructive" data-testid="alert">
        Error
      </Alert>
    );
    expect(screen.getByTestId('alert').className).toContain('destructive');
  });

  it('passes custom className', () => {
    render(
      <Alert className="extra-class" data-testid="alert">
        x
      </Alert>
    );
    expect(screen.getByTestId('alert').className).toContain('extra-class');
  });

  it('AlertTitle renders', () => {
    render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
      </Alert>
    );
    expect(screen.getByText('Warning')).toBeTruthy();
  });

  it('AlertDescription renders', () => {
    render(
      <Alert>
        <AlertDescription>Details here</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Details here')).toBeTruthy();
  });

  it('AlertTitle passes className', () => {
    render(
      <Alert>
        <AlertTitle className="title-extra" data-testid="at">
          T
        </AlertTitle>
      </Alert>
    );
    expect(screen.getByTestId('at').className).toContain('title-extra');
  });

  it('AlertDescription passes className', () => {
    render(
      <Alert>
        <AlertDescription className="desc-extra" data-testid="ad">
          D
        </AlertDescription>
      </Alert>
    );
    expect(screen.getByTestId('ad').className).toContain('desc-extra');
  });
});
