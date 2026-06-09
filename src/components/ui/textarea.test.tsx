import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId('textarea').tagName).toBe('TEXTAREA');
  });

  it('passes placeholder', () => {
    render(<Textarea placeholder="Type here" data-testid="textarea" />);
    expect(screen.getByPlaceholderText('Type here')).toBeTruthy();
  });

  it('passes value and onChange', () => {
    render(<Textarea data-testid="textarea" />);
    const ta = screen.getByTestId('textarea');
    fireEvent.change(ta, { target: { value: 'hello' } });
    expect((ta as HTMLTextAreaElement).value).toBe('hello');
  });

  it('passes custom className', () => {
    render(<Textarea className="my-ta" data-testid="textarea" />);
    expect(screen.getByTestId('textarea').className).toContain('my-ta');
  });

  it('can be disabled', () => {
    render(<Textarea disabled data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  it('passes rows attribute', () => {
    render(<Textarea rows={5} data-testid="textarea" />);
    expect(screen.getByTestId('textarea').getAttribute('rows')).toBe('5');
  });
});
