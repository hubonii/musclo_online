import axios from 'axios';
import { apiGet, apiPost, getValidationErrors, apiClient } from '../../../src/api/axios';

jest.mock('axios', () => {
  const mAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  return {
    create: jest.fn(() => mAxiosInstance),
    get: jest.fn(),
    isAxiosError: jest.fn()
  };
});

describe('api/axios helper units', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('apiGet', () => {
    test('returns response data on success', async () => {
      apiClient.get.mockResolvedValue({ data: { data: { id: 1, name: 'Test' } } });
      
      const result = await apiGet('/users/1');
      
      expect(apiClient.get).toHaveBeenCalledWith('/users/1', { params: undefined });
      expect(result).toEqual({ id: 1, name: 'Test' });
    });
    
    test('returns null if response data does not have data field', async () => {
      apiClient.get.mockResolvedValue({ data: {} });
      
      const result = await apiGet('/users/1');
      
      expect(result).toBeNull();
    });
  });

  describe('apiPost', () => {
    test('sends data and returns response', async () => {
      apiClient.post.mockResolvedValue({ data: { data: { success: true } } });
      
      const result = await apiPost('/login', { email: 'test@example.com' });
      
      expect(apiClient.post).toHaveBeenCalledWith('/login', { email: 'test@example.com' }, undefined);
      expect(result).toEqual({ success: true });
    });
  });

  describe('getValidationErrors', () => {
    test('extracts field errors from 422 response', () => {
      axios.isAxiosError.mockReturnValue(true);
      const mockError = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: { email: ['Email is invalid'] }
          }
        }
      };

      const result = getValidationErrors(mockError);
      
      expect(result).toEqual(mockError.response.data);
    });

    test('returns null for non-422 errors or non-axios errors', () => {
      axios.isAxiosError.mockReturnValue(true);
      const mock500Error = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };

      const result = getValidationErrors(mock500Error);
      
      expect(result).toBeNull();
    });
    
    test('returns null if not an axios error', () => {
      axios.isAxiosError.mockReturnValue(false);
      const result = getValidationErrors(new Error('Normal error'));
      expect(result).toBeNull();
    });
  });
});
