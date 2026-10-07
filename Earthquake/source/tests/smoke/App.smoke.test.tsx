import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../../src/App';

describe('Earthquake Simulator shell', () => {
  it('renders the landmark choices and primary earthquake controls', () => {
    render(<App />);

    expect(screen.getByRole('navigation', { name: /landmark/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Smaller' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bigger' })).toBeInTheDocument();
  });
});
