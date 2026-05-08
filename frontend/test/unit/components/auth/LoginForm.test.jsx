import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginForm from '../../../../src/components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../src/stores/useAuthStore';
import { useToast } from '../../../../src/components/ui/Toast';

// --- Routing & Library Mocks ---
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// --- API & State Store Mocks ---
jest.mock('../../../../src/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

// --- UI & Domain Component Mocks ---
jest.mock('../../../../src/components/ui/Toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../../../src/components/ui/Input', () => ({
  __esModule: true,
  default: ({ label, value, onChange, type = 'text' }) => (
    <label>
      {label}
      <input aria-label={label} type={type} value={value} onChange={onChange} />
    </label>
  ),
}));

jest.mock('../../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, type = 'button' }) => <button type={type}>{children}</button>,
}));

jest.mock('lucide-react', () => ({
  Mail: () => null,
  Lock: () => null,
}));

describe('LoginForm', () => {
  const navigate = jest.fn();
  const login = jest.fn();
  const toast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(navigate);
    useAuthStore.mockReturnValue({ login, isAuthenticating: false });
    useToast.mockReturnValue({ toast });
  });

  test('submits credentials and navigates on success', async () => {
    login.mockResolvedValue({});
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email or Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('testuser', 'secret123');
    });

    expect(toast).toHaveBeenCalledWith('success', 'Welcome back!');
    expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  test('shows API error message when login fails', async () => {
    login.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email or Username'), { target: { value: 'baduser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('error', 'Login failed', 'Invalid credentials');
    });
    expect(navigate).not.toHaveBeenCalled();
  });
});
