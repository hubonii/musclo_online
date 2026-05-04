// Unit tests for HistoryPage — paginated workout lists and detail navigation.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HistoryPage from '../../../src/pages/HistoryPage';
import { apiClient } from '../../../src/api/axios';
import { useToast } from '../../../src/components/ui/Toast';
import { useSettings } from '../../../src/hooks/useSettings';

jest.mock('../../../src/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../../src/components/ui/Toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../../src/hooks/useSettings', () => ({
  useSettings: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

jest.mock('lucide-react', () => ({
  Clock: () => null,
  Target: () => null,
  ChevronRight: () => null,
  Activity: () => null,
}));

jest.mock('../../../src/components/ui/Card', () => ({
  __esModule: true,
  default: ({ children, onClick }) => <div onClick={onClick}>{children}</div>,
}));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: ({ message }) => <div>{message}</div>,
}));

jest.mock('../../../src/components/ui/Badge', () => ({
  __esModule: true,
  default: ({ children }) => <span>{children}</span>,
}));

jest.mock('../../../src/components/ui/EmptyState', () => ({
  __esModule: true,
  default: ({ title }) => <div>{title}</div>,
}));

jest.mock('../../../src/components/history/WorkoutDetailModal', () => ({
  __esModule: true,
  default: ({ workoutId }) => <div>WorkoutDetailModal:{String(workoutId)}</div>,
}));

describe('HistoryPage', () => {
  const toast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useToast.mockReturnValue({ toast });
    useSettings.mockReturnValue({ data: { unit_system: 'metric' } });
  });

  test('shows loading state on first render', () => {
    apiClient.get.mockReturnValue(new Promise(() => {}));

    render(<HistoryPage />);

    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  test('shows empty state when no workout history exists', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });

    render(<HistoryPage />);

    expect(await screen.findByText('No history yet')).toBeInTheDocument();
  });

  test('toasts an error when history fetch fails', async () => {
    apiClient.get.mockRejectedValue(new Error('network'));

    render(<HistoryPage />);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('error', 'Failed to load workout history');
    });
  });

  test('opens workout detail modal when workout row is clicked', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 17,
            name: 'Leg Day',
            started_at: '2026-04-18T10:00:00.000Z',
            duration_seconds: 1800,
            total_volume: '1500',
            sets: [{ id: 1 }],
            top_muscles: ['Quads'],
          },
        ],
      },
    });

    render(<HistoryPage />);

    const workoutCard = await screen.findByText('Leg Day');
    fireEvent.click(workoutCard);

    expect(screen.getByText('WorkoutDetailModal:17')).toBeInTheDocument();
  });
});

