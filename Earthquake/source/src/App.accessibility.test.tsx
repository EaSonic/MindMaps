import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('Earthquake Simulator accessibility', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('provides accessible names and native keyboard controls for every action', () => {
    render(<App />);

    for (const name of ['Eiffel Tower', 'Tower of Pisa', 'Empire State', 'Twin Towers', 'Start', 'Finish', 'Smaller', 'Bigger', 'Mute alarm']) {
      const button = screen.getByRole('button', { name });
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAccessibleName(name);
    }

    const start = screen.getByRole('button', { name: 'Start' });
    start.focus();
    fireEvent.click(start);
    expect(screen.getByTestId('simulation-stage')).toHaveAttribute('data-status', 'running');
  });

  it('reports reduced-motion preference to the simulation stage', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    render(<App />);
    expect(screen.getByTestId('simulation-stage')).toHaveAttribute('data-reduced-motion', 'true');
  });

  it('toggles the alarm mute state without interrupting the simulation', () => {
    render(<App />);
    const mute = screen.getByRole('button', { name: 'Mute alarm' });

    fireEvent.click(mute);
    expect(screen.getByRole('button', { name: 'Unmute alarm' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByTestId('simulation-stage')).toHaveAttribute('data-status', 'running');
  });
});
