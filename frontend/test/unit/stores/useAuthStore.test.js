// Unit tests for useAuthStore — login, logout, and session restoration.
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { apiClient, apiGet, getCsrfCookie } from '../../../src/api/axios';

jest.mock('../../../src/api/axios', () => ({
  apiClient: {
    post: jest.fn(),
  },
  apiGet: jest.fn(),
  getCsrfCookie: jest.fn(),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAuthenticating: false,
      isInitializing: false,
    });
  });

  test('login stores user and authenticated state', async () => {
    getCsrfCookie.mockResolvedValue(undefined);
    apiClient.post.mockResolvedValue({
      data: {
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
      },
    });

    await useAuthStore.getState().login('test@example.com', 'secret');

    expect(getCsrfCookie).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith('/login', {
      email: 'test@example.com',
      password: 'secret',
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(useAuthStore.getState().isAuthenticating).toBe(false);
  });

  test('logout clears local auth state even if API logout fails', async () => {
    useAuthStore.setState({
      user: { id: 2, name: 'Existing User', email: 'existing@example.com' },
      isAuthenticated: true,
    });

    getCsrfCookie.mockResolvedValue(undefined);
    apiClient.post.mockRejectedValue(new Error('session already expired'));

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  test('fetchUser populates user on success and clears state on failure', async () => {
    apiGet.mockResolvedValueOnce({
      id: 7,
      name: 'Fetched User',
      email: 'fetched@example.com',
    });

    await useAuthStore.getState().fetchUser();

    expect(apiGet).toHaveBeenCalledWith('/user');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual({
      id: 7,
      name: 'Fetched User',
      email: 'fetched@example.com',
    });

    apiGet.mockRejectedValueOnce(new Error('401'));
    await useAuthStore.getState().fetchUser();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });
});


