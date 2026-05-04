// Tiny render smoke test to confirm React test environment is working.
import React from 'react';
import { render, screen } from '@testing-library/react';

function Sample() {
  return <h1>Musclo Test Render</h1>;
}

describe('react render smoke', () => {
  test('renders a simple heading', () => {
    render(<Sample />);
    expect(screen.getByRole('heading', { name: 'Musclo Test Render' })).toBeInTheDocument();
  });
});


