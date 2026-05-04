// Unit tests for RegisterForm — new user creation and validation.
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RegisterForm from '../../../../src/components/auth/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../src/stores/useAuthStore';
import { getCsrfCookie } from '../../../../src/api/axios';
import { useToast } from '../../../../src/components/ui/Toast';

// --- Routing & Library Mocks ---
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// --- API & State Store Mocks ---
jest.mock('../../../../src/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../../src/api/axios', () => ({
  getCsrfCookie: jest.fn(),
  apiPost: jest.fn(),
}));

// --- UI & Domain Component Mocks ---
jest.mock('../../../../src/components/ui/Toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../../../src/components/ui/Input', () => ({
  __esModule: true,
  default: ({ label, value, onChange, type = 'text', error }) => (
    <label>
      {label}
      <input aria-label={label} type={type} value={value} onChange={onChange} />
      {error ? <span>{error}</span> : null}
    </label>
  ),
}));

jest.mock('../../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, type = 'button' }) => <button type={type}>{children}</button>,
}));

jest.mock('lucide-react', () => ({
  User: () => null,
  Mail: () => null,
  Lock: () => null,
}));

describe('RegisterForm', () => {
  const navigate = jest.fn();
  const register = jest.fn();
  const toast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(navigate);
    useAuthStore.mockReturnValue({ register, isAuthenticating: false });
    useToast.mockReturnValue({ toast });
    getCsrfCookie.mockResolvedValue({});
  });

  test('shows client-side mismatch error and skips API calls', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@musclo.app' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'abc12345' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(getCsrfCookie).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
  });

  test('registers and redirects on success', async () => {
    register.mockResolvedValue({});
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@musclo.app' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'abc12345' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'abc12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(getCsrfCookie).toHaveBeenCalled();
      expect(register).toHaveBeenCalledWith('Jane Doe', 'jane@musclo.app', 'abc12345', 'abc12345');
    });

    expect(toast).toHaveBeenCalledWith('success', 'Account created!', 'Welcome to Musclo.');
    expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });
});

