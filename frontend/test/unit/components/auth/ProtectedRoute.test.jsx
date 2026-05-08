import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../../../../src/components/auth/ProtectedRoute';
import { useAuthStore } from '../../../../src/stores/useAuthStore';

jest.mock('../../../../src/stores/useAuthStore');

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects unauthenticated users to login route', () => {
    // Mocking Zustand selector behavior
    useAuthStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ isAuthenticated: false });
      }
      return { isAuthenticated: false };
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Private dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<h1>Welcome back</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  test('renders children for authenticated users', () => {
    useAuthStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ isAuthenticated: true });
      }
      return { isAuthenticated: true };
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Private dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Private dashboard')).toBeInTheDocument();
  });
});
