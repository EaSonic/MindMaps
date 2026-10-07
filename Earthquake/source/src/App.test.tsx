import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Earthquake Simulator gameplay screen', () => {
  it('keeps landmark choices at the top and controls in the requested bottom order', () => {
    render(<App />);

    const landmarkNav = screen.getByRole('navigation', { name: /landmark/i });
    expect(within(landmarkNav).getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Eiffel Tower',
      'Tower of Pisa',
      'Empire State',
      'Twin Towers',
    ]);

    const controls = screen.getByRole('group', { name: /earthquake controls/i });
    expect(within(controls).getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Start',
      'Finish',
      'Smaller',
      'Bigger',
    ]);
  });

  it('changes strength and exposes the current intensity', () => {
    render(<App />);
    const meter = screen.getByRole('meter', { name: /earthquake strength/i });

    expect(meter).toHaveAttribute('aria-valuenow', '2');
    fireEvent.click(screen.getByRole('button', { name: 'Bigger' }));
    expect(meter).toHaveAttribute('aria-valuenow', '3');
    fireEvent.click(screen.getByRole('button', { name: 'Smaller' }));
    expect(meter).toHaveAttribute('aria-valuenow', '2');
  });

  it('uses realistic location-specific housing around each landmark', () => {
    render(<App />);
    const stage = screen.getByTestId('simulation-stage');

    expect(stage).toHaveStyle({ backgroundImage: 'url(/art/city-paris-realistic.png)' });
    fireEvent.click(screen.getByRole('button', { name: 'Tower of Pisa' }));
    expect(stage).toHaveStyle({ backgroundImage: 'url(/art/city-pisa-realistic.png)' });
    fireEvent.click(screen.getByRole('button', { name: 'Empire State' }));
    expect(stage).toHaveStyle({ backgroundImage: 'url(/art/city-midtown-realistic.png)' });
    fireEvent.click(screen.getByRole('button', { name: 'Twin Towers' }));
    expect(stage).toHaveStyle({ backgroundImage: 'url(/art/city-lower-manhattan-realistic.png)' });
  });

  it('starts, finishes, rebuilds, and switches landmarks', () => {
    render(<App />);
    const stage = screen.getByTestId('simulation-stage');

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByRole('status')).toHaveTextContent(/earthquake active/i);
    expect(stage).toHaveAttribute('data-status', 'running');
    expect(stage).toHaveAttribute('data-run', '1');

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(stage).toHaveAttribute('data-status', 'finished');

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(stage).toHaveAttribute('data-status', 'running');
    expect(stage).toHaveAttribute('data-run', '2');

    fireEvent.click(screen.getByRole('button', { name: 'Tower of Pisa' }));
    expect(stage).toHaveAttribute('data-landmark', 'pisa');
    expect(stage).toHaveAttribute('data-status', 'ready');
  });
});
