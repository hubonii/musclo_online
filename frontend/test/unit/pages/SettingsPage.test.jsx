// Unit tests for SettingsPage — save payloads and export flow feedback.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../../../src/pages/SettingsPage';
import { useSettings, useUpdateSettings } from '../../../src/hooks/useSettings';
import { useThemeStore } from '../../../src/stores/useThemeStore';
import { useToast } from '../../../src/components/ui/Toast';
import { apiClient } from '../../../src/api/axios';

// --- Library & Motion Mocks ---
jest.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
}));

jest.mock('lucide-react', () => ({
  Settings: () => null,
  Save: () => null,
  Download: () => null,
  Shield: () => null,
  Moon: () => null,
  Sun: () => null,
  Monitor: () => null,
  Clock: () => null,
  Globe: () => null,
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

jest.mock('../../../src/stores/useThemeStore', () => ({
  useThemeStore: jest.fn(),
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
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div>Loading Spinner</div>,
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('saves settings payload with updated values', async () => {
    const mutate = jest.fn();
    const toast = jest.fn();
    const setTheme = jest.fn();

    useSettings.mockReturnValue({
      data: { unit_system: 'metric', theme: 'system', default_rest_timer_seconds: 90 },
      isLoading: false,
    });
    useUpdateSettings.mockReturnValue({ mutate, isPending: false });
    useToast.mockReturnValue({ toast });
    useThemeStore.mockImplementation((selector) => selector({ theme: 'system', setTheme }));

    render(<SettingsPage />);

    fireEvent.click(screen.getByText('Imperial (lbs)'));
    fireEvent.change(screen.getByDisplayValue('90'), { target: { value: '75' } });
    fireEvent.click(screen.getByText('Save Settings'));

    expect(mutate).toHaveBeenCalledWith(
      {
        unit_system: 'imperial',
        theme: 'system',
        default_rest_timer_seconds: 75,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  test('exports csv and shows success toast', async () => {
    const toast = jest.fn();

    useSettings.mockReturnValue({
      data: { unit_system: 'metric', theme: 'light', default_rest_timer_seconds: 90 },
      isLoading: false,
    });
    useUpdateSettings.mockReturnValue({ mutate: jest.fn(), isPending: false });
    useToast.mockReturnValue({ toast });
    useThemeStore.mockImplementation((selector) => selector({ theme: 'light', setTheme: jest.fn() }));

    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const removeSpy = jest.spyOn(document.body, 'removeChild');
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createObjectURL = jest.fn(() => 'blob:mock');
    const revokeObjectURL = jest.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;

    apiClient.get.mockResolvedValue({ data: new Blob(['a,b']) });

    render(<SettingsPage />);

    fireEvent.click(screen.getByText('Export Workout Data'));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/export/csv', { responseType: 'blob' });
    });

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('success', 'Data exported successfully.');

    appendSpy.mockRestore();
    removeSpy.mockRestore();
    clickSpy.mockRestore();
  });

  test('shows error toast when export fails', async () => {
    const toast = jest.fn();

    useSettings.mockReturnValue({
      data: { unit_system: 'metric', theme: 'light', default_rest_timer_seconds: 90 },
      isLoading: false,
    });
    useUpdateSettings.mockReturnValue({ mutate: jest.fn(), isPending: false });
    useToast.mockReturnValue({ toast });
    useThemeStore.mockImplementation((selector) => selector({ theme: 'light', setTheme: jest.fn() }));

    apiClient.get.mockRejectedValue(new Error('export failed'));

    render(<SettingsPage />);

    fireEvent.click(screen.getByText('Export Workout Data'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('error', 'Failed to export data.');
    });
  });
});


