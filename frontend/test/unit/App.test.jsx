import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { initOfflineSync } from '../../src/lib/offlineQueue';

// --- Mocks ---
jest.mock('../../src/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../src/lib/offlineQueue', () => ({
  initOfflineSync: jest.fn(),
  getPendingCount: jest.fn(() => 0),
  flushQueue: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  RouterProvider: () => <div data-testid="router-provider">App Content</div>,
}));

describe('App Root Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const state = { user: null, isAuthenticated: false, fetchUser: jest.fn() };
    useAuthStore.mockImplementation((selector) => typeof selector === 'function' ? selector(state) : state);
    useAuthStore.getState = jest.fn(() => state);
    window.history.replaceState({}, '', '/');
  });

  test('renders without crashing and shows router content', () => {
    render(<App />);
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
  });

  test('initializes offline sync when user is logged in', () => {
    const state = { user: { id: 123 }, isAuthenticated: true, fetchUser: jest.fn() };
    useAuthStore.mockImplementation((selector) => typeof selector === 'function' ? selector(state) : state);
    render(<App />);
    expect(initOfflineSync).toHaveBeenCalledWith(123);
  });

  test('extracts and saves token from URL search params', () => {
    window.history.replaceState({}, '', '/?token=url-token');
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const fetchUserMock = jest.fn();
    useAuthStore.getState.mockReturnValue({ fetchUser: fetchUserMock });

    render(<App />);

    expect(setItemSpy).toHaveBeenCalledWith('musclo-token', 'url-token');
    expect(fetchUserMock).toHaveBeenCalled();
  });
});
