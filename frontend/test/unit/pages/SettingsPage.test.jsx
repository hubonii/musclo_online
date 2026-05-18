import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../../../src/pages/SettingsPage';
import { useSettings, useUpdateSettings } from '../../../src/hooks/useSettings';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { useToast } from '../../../src/components/ui/Toast';
import { apiClient } from '../../../src/api/axios';

// --- Library & Motion Mocks ---
jest.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
}));

jest.mock('lucide-react', () => ({
  User: () => null,
  Mail: () => null,
  Lock: () => null,
  Camera: () => null,
  Globe: () => null,
  Save: () => null,
  Download: () => null,
  Shield: () => null,
  CheckCircle2: () => null,
  Trash2: () => null,
  X: () => null,
  Sun: () => null,
  Moon: () => null,
  LogOut: () => null,
}));

jest.mock('../../../src/lib/motion', () => ({
  __esModule: true,
  MOTION: { pageEnter: {} }
}));

// --- API & State Store Mocks ---
jest.mock('../../../src/hooks/useSettings', () => ({
  useSettings: jest.fn(),
  useUpdateSettings: jest.fn(),
}));

jest.mock('../../../src/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

// --- UI Component Mocks ---
jest.mock('../../../src/components/ui/Toast', () => ({
  __esModule: true,
  useToast: jest.fn(),
}));

jest.mock('../../../src/components/ui/Card', () => ({
  __esModule: true,
  default: ({ children, className }) => <div className={className}>{children}</div>,
}));

jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled, isLoading }) => (
    <button onClick={onClick} disabled={disabled || isLoading}>
      {children}
    </button>
  ),
}));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

jest.mock('../../../src/components/ui/Avatar', () => ({
  __esModule: true,
  default: () => <div>Avatar</div>,
}));

jest.mock('../../../src/components/ui/Modal', () => ({
  __esModule: true,
  default: ({ children, open, title }) => open ? (
    <div data-testid="mock-modal">
      <h2>{title}</h2>
      {children}
    </div>
  ) : null,
}));

jest.mock('../../../src/components/ui/Input', () => ({
  __esModule: true,
  default: ({ label, value, onChange, placeholder, disabled }) => (
    <div>
      <label>{label}</label>
      <input 
        aria-label={label} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        disabled={disabled}
      />
    </div>
  ),
}));

describe('SettingsPage', () => {
  const updateProfile = jest.fn();
  const updateSettings = jest.fn();
  const toast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.mockReturnValue({
      user: { id: 1, name: 'Jane Doe', email: 'jane@musclo.app', username: 'jane_doe' },
      updateProfile,
      isLoading: false,
    });
    useSettings.mockReturnValue({
      data: { unit_system: 'metric' },
      isLoading: false,
    });
    useUpdateSettings.mockReturnValue({ mutate: updateSettings, isPending: false });
    useToast.mockReturnValue({ toast });
  });

  test('renders profile data and handles updates', async () => {
    render(<SettingsPage />);

    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane_doe')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jsmith' } });
    fireEvent.click(screen.getByText('Imperial (lbs)'));

    fireEvent.click(screen.getByText(/Save Profile Changes/i));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Jane Smith',
        username: 'jsmith'
      }));
      expect(updateSettings).toHaveBeenCalledWith(expect.objectContaining({
        unit_system: 'imperial'
      }));
    });
  });

  test('exports data successfully', async () => {
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
    window.URL.revokeObjectURL = jest.fn();
    apiClient.get.mockResolvedValue({ data: new Blob(['csv']) });

    render(<SettingsPage />);

    fireEvent.click(screen.getByText(/Export Data/i));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/export/csv', { responseType: 'blob' });
      expect(toast).toHaveBeenCalledWith('success', 'Data exported successfully.');
    });
  });
});
