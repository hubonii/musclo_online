import React from 'react';
import { render } from '@testing-library/react';
import GoogleCallback from '../../../src/pages/GoogleCallback';
import { useSearchParams } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
}));

describe('GoogleCallback', () => {
  const originalClose = window.close;
  const originalPostMessage = window.opener ? window.opener.postMessage : null;

  beforeEach(() => {
    jest.clearAllMocks();
    window.close = jest.fn();
    localStorage.clear();
    
    // Mock window.opener
    delete window.opener;
    window.opener = { postMessage: jest.fn() };
    
    // Default mock implementation for search params
    useSearchParams.mockReturnValue([{ get: (key) => key === 'token' ? 'test-token' : null }]);
  });

  afterAll(() => {
    window.close = originalClose;
  });

  test('extracts token from URL and saves to localStorage', () => {
    render(<GoogleCallback />);
    
    expect(localStorage.getItem('musclo-token')).toBe('test-token');
  });

  test('sends postMessage to opener with token', () => {
    render(<GoogleCallback />);
    
    expect(window.opener.postMessage).toHaveBeenCalledWith(
      { type: 'GOOGLE_AUTH_SUCCESS', token: 'test-token' },
      '*'
    );
  });

  test('closes window after processing', () => {
    render(<GoogleCallback />);
    
    expect(window.close).toHaveBeenCalled();
  });

  test('handles case where no token is provided gracefully', () => {
    useSearchParams.mockReturnValue([{ get: () => null }]);
    render(<GoogleCallback />);
    
    expect(localStorage.getItem('musclo-token')).toBeNull();
    expect(window.opener.postMessage).not.toHaveBeenCalled();
    expect(window.close).toHaveBeenCalled();
  });
});
