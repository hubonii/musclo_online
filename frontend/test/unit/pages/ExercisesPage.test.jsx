// Unit tests for ExercisesPage — search, filtration, and lazy-loading.
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ExercisesPage from '../../../src/pages/ExercisesPage';
import { apiClient } from '../../../src/api/axios';
import { useToast } from '../../../src/components/ui/Toast';

// --- Library & Motion Mocks ---
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({
  Search: () => null,
  SlidersHorizontal: () => null,
}));

// --- API & State Mocks ---
jest.mock('../../../src/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
  },
  API_URL: 'http://127.0.0.1:8000',
}));

jest.mock('../../../src/components/ui/Toast', () => ({
  useToast: jest.fn(),
}));

// --- Domain Component Mocks ---
jest.mock('../../../src/components/exercises/ExerciseCard', () => ({
  __esModule: true,
  default: ({ exercise, onClick }) => (
    <button onClick={() => onClick(exercise)}>{exercise.name}</button>
  ),
}));

jest.mock('../../../src/components/exercises/FilterModal', () => ({
  __esModule: true,
  default: ({ isOpen, setSelectedBodyPart, setSelectedEquipment }) =>
    isOpen ? (
      <div>
        <button onClick={() => setSelectedBodyPart('Back')}>Set BodyPart</button>
        <button onClick={() => setSelectedEquipment('Barbell')}>Set Equipment</button>
      </div>
    ) : null,
}));

jest.mock('../../../src/components/exercises/ExerciseDetailModal', () => ({
  __esModule: true,
  default: ({ exercise }) => <div>ExerciseDetail:{exercise ? exercise.id : 'none'}</div>,
}));

// --- UI Component Mocks ---
jest.mock('../../../src/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: ({ message }) => <div>{message}</div>,
}));

jest.mock('../../../src/components/ui/EmptyState', () => ({
  __esModule: true,
  default: ({ title }) => <div>{title}</div>,
}));

describe('ExercisesPage', () => {
  const toast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useToast.mockReturnValue({ toast });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('loads and renders exercise cards after debounce', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [{ id: 1, name: 'Bench Press' }] } });

    render(<ExercisesPage />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(await screen.findByText('Bench Press')).toBeInTheDocument();
    expect(apiClient.get).toHaveBeenCalledWith('/exercises', {
      params: {
        limit: 2000,
        search: undefined,
        body_part: undefined,
        equipment: undefined,
      },
    });
  });

  test('applies quick category filter and refetches with body part param', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [{ id: 2, name: 'Incline Press' }] } });

    render(<ExercisesPage />);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    await screen.findByText('Incline Press');

    const chestChip = screen.getByAltText('Chest').closest('button');
    fireEvent.click(chestChip);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenLastCalledWith('/exercises', {
        params: {
          limit: 2000,
          search: undefined,
          body_part: 'Chest',
          equipment: undefined,
        },
      });
    });
  });

  test('shows empty state when API returns no exercises', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });

    render(<ExercisesPage />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(await screen.findByText('No exercises found')).toBeInTheDocument();
  });

  test('toasts an error when exercise fetch fails', async () => {
    apiClient.get.mockRejectedValue(new Error('network'));

    render(<ExercisesPage />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('error', 'Failed to load exercises');
    });
  });

  test('search input renders and triggers a search refetch', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });

    render(<ExercisesPage />);

    // Wait for initial render and debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    const searchInput = screen.getByPlaceholderText('Search for exercises');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, {
      target: { value: 'squat' },
    });

    // Advance debounce timer
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenLastCalledWith('/exercises', {
        params: {
          limit: 2000,
          search: 'squat',
          body_part: undefined,
          equipment: undefined,
        },
      });
    });
  });
});


