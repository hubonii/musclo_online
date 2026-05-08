import { useAuthStore } from '../../../src/stores/useAuthStore';
import { apiPost, apiGet } from '../../../src/api/axios';

// --- Module Mocks ---
jest.mock('../../../src/api/axios', () => ({
  apiPost: jest.fn(),
  apiGet: jest.fn(),
  apiClient: {
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().reset();
    localStorage.clear();
  });

  test('login updates state and saves token', async () => {
    const mockUser = { id: 1, email: 'test@example.com', username: 'testuser' };
    apiPost.mockResolvedValue({ user: mockUser, token: 'mock-token' });

    await useAuthStore.getState().login('testuser', 'password');

    expect(apiPost).toHaveBeenCalledWith('/login', { identifier: 'testuser', password: 'password' });
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(localStorage.getItem('musclo-token')).toBe('mock-token');
  });

  test('register sends name, email, and username', async () => {
    apiPost.mockResolvedValue({ user: { id: 2 }, token: 't' });

    await useAuthStore.getState().register('Name', 'e@e.com', 'user123', 'p', 'p');

    expect(apiPost).toHaveBeenCalledWith('/register', expect.objectContaining({
      name: 'Name',
      email: 'e@e.com',
      username: 'user123'
    }));
  });

  test('logout clears state and storage', async () => {
    useAuthStore.setState({ user: { id: 1 }, isAuthenticated: true });
    localStorage.setItem('musclo-token', 't');

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('musclo-token')).toBeNull();
  });

  test('fetchUser hydrates state if successful', async () => {
    const mockUser = { id: 5, email: 'h@h.com' };
    apiGet.mockResolvedValue(mockUser);

    await useAuthStore.getState().fetchUser();

    expect(apiGet).toHaveBeenCalledWith('/user');
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
