// Unit tests for ErrorBoundary — crash recovery and fallback UI.
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../../../src/components/ui/ErrorBoundary';

function Bomb() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  const originalConsoleGroup = console.group;
  const originalConsoleGroupEnd = console.groupEnd;

  beforeAll(() => {
    console.error = jest.fn();
    console.group = jest.fn();
    console.groupEnd = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.group = originalConsoleGroup;
    console.groupEnd = originalConsoleGroupEnd;
  });

  test('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByText(/critical error occurred/i)).toBeInTheDocument();
  });
});


