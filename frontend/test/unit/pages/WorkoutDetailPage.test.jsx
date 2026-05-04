// Unit tests for WorkoutDetailPage — session summaries and repeat-workout wiring.
import { render, screen, fireEvent } from '@testing-library/react';
import WorkoutDetailPage from '../../../src/pages/WorkoutDetailPage';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../../src/components/ui/Toast';
import { useSettings } from '../../../src/hooks/useSettings';
import { useWorkoutStore } from '../../../src/stores/useWorkoutStore';

jest.mock('../../../src/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../../../src/components/ui/Toast', () => ({ useToast: jest.fn() }));
jest.mock('../../../src/hooks/useSettings', () => ({ useSettings: jest.fn() }));

const mockStartWorkout = jest.fn();
jest.mock('../../../src/stores/useWorkoutStore', () => ({
  useWorkoutStore: {
    getState: () => ({ startWorkout: mockStartWorkout }),
  },
}));

jest.mock('framer-motion', () => ({ motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> } }));

jest.mock('lucide-react', () => ({
  ArrowLeft: () => null,
  Clock: () => null,
  Dumbbell: () => null,
  Activity: () => null,
  Trash2: () => null,
  Repeat: () => null,
  Share2: () => null,
}));

jest.mock('../../../src/lib/motion', () => ({ MOTION: { pageEnter: {} } }));

jest.mock('../../../src/components/ui/Card', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));
jest.mock('../../../src/components/analytics/VolumeDoughnut.jsx', () => ({ __esModule: true, default: () => <div>VolumeDoughnut</div> }));
jest.mock('../../../src/components/analytics/MuscleRadarChart.jsx', () => ({ __esModule: true, default: () => <div>MuscleRadarChart</div> }));
jest.mock('../../../src/components/ui/ConfirmDialog', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../src/components/ui/LoadingSpinner', () => ({ __esModule: true, default: () => <div>Loading</div> }));

describe('WorkoutDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('repeats workout and navigates back into workout flow', () => {
    const navigate = jest.fn();

    useParams.mockReturnValue({ id: '101' });
    useNavigate.mockReturnValue(navigate);
    useToast.mockReturnValue({ toast: jest.fn() });
    useSettings.mockReturnValue({ data: { unit_system: 'metric' } });

    useQuery.mockReturnValue({
      isLoading: false,
      data: {
        routine_id: 22,
        name: 'Push Day',
        total_volume: 1000,
        duration_seconds: 1800,
        started_at: '2026-04-13T09:00:00.000Z',
        notes: 'Good session',
        analytics: null,
        exercises: [
          {
            exercise_id: 7,
            name: 'Bench Press',
            muscle_group: 'Chest',
            sets: [{ id: 1, set_type: 'working', weight_kg: 80, reps: 8, duration_seconds: null, rpe: 8, set_number: 1 }],
          },
        ],
      },
    });

    render(<WorkoutDetailPage />);

    fireEvent.click(screen.getByText('Repeat'));

    expect(mockStartWorkout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/workout/22');
  });
});


