import { apiClient, apiGet, apiPost } from '../../../src/api/axios';
import { useAuthStore } from '../../../src/stores/useAuthStore';

// --- Mocks ---
jest.mock('../../../src/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ reset: jest.fn() })),
  },
}));

describe('Axios API Client', () => {
  const originalLocation = window.location;

  beforeAll(() => {
    delete window.location;
    window.location = { href: '', pathname: '' };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('request interceptor adds Authorization header if token exists', async () => {
    localStorage.setItem('musclo-token', 'test-jwt-token');
    
    // We can't easily trigger the real interceptor without making a request, 
    // but we can check the config passed to the adapters.
    // For unit tests, we check that the logic exists.
    const config = { headers: {} };
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const result = interceptor(config);
    
    expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
  });

  test('response interceptor handles 401 and redirects to login', async () => {
    const resetMock = jest.fn();
    useAuthStore.getState.mockReturnValue({ reset: resetMock });
    
    const error = {
      response: { status: 401 },
      config: {}
    };
    
    const interceptor = apiClient.interceptors.response.handlers[0].rejected;
    
    try {
      await interceptor(error);
    } catch (e) {
      // Expected
    }
    
    expect(resetMock).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  test('apiGet extracts data.data payload', async () => {
    const mockResponse = { data: { data: { id: 1, name: 'Test' } } };
    jest.spyOn(apiClient, 'get').mockResolvedValue(mockResponse);
    
    const result = await apiGet('/test');
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  test('apiPost extracts data.data payload', async () => {
    const mockResponse = { data: { data: { success: true } } };
    jest.spyOn(apiClient, 'post').mockResolvedValue(mockResponse);
    
    const result = await apiPost('/test', { foo: 'bar' });
    expect(result).toEqual({ success: true });
  });
});
