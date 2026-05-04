// Unit tests for WorkoutPage — active session management and global store syncing.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkoutPage from '../../../src/pages/WorkoutPage';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../../../src/stores/useWorkoutStore';
import { useRestTimerStore } from '../../../src/stores/useRestTimerStore';
import { useToast } from '../../../src/components/ui/Toast';
import { apiGet } from '../../../src/api/axios';
import { useSettings } from '../../../src/hooks/useSettings';
import { useMeasurements } from '../../../src/hooks/useMeasurements';
import { useQueryClient } from '@tanstack/react-query';

// --- Routing & Library Mocks ---
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({
  Play: () => null,
  Plus: () => null,
  StickyNote: () => null,
}));

jest.mock('../../../src/lib/motion', () => ({ MOTION: { pageEnter: {} } }));

// --- API & State Store Mocks ---
jest.mock('../../../src/stores/useWorkoutStore', () => ({
  useWorkoutStore: jest.fn(),
}));

jest.mock('../../../src/stores/useRestTimerStore', () => ({
  useRestTimerStore: jest.fn(),
}));

jest.mock('../../../src/api/axios', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

jest.mock('../../../src/hooks/useSettings', () => ({ useSettings: jest.fn() }));
jest.mock('../../../src/hooks/useMeasurements', () => ({ useMeasurements: jest.fn() }));
jest.mock('@tanstack/react-query', () => ({ useQueryClient: jest.fn() }));

// --- UI & Domain Component Mocks ---
jest.mock('../../../src/components/ui/Toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('../../../src/components/ui/Textarea', () => ({
  __esModule: true,
  default: (props) => <textarea {...props} />,
}));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div>Loading Spinner</div>,
}));

jest.mock('../../../src/components/ui/Card', () => ({
  __esModule: true,
  default: ({ children, onClick }) => <div onClick={onClick}>{children}</div>,
}));

jest.mock('../../../src/components/ui/ConfirmDialog', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../src/components/ui/Modal', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../src/components/routines/ExercisePicker', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../src/components/workout/WorkoutHeader', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../src/components/workout/ExerciseCard', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../src/components/workout/WorkoutFinishDialog', () => ({ __esModule: true, default: () => null }));

describe('WorkoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Verify the empty workout flow correctly bootstraps a "Freestyle" session via the global store.
  test('starts empty workout from inactive state', async () => {
    const startWorkout = jest.fn();
    const toast = jest.fn();

    useParams.mockReturnValue({ routineId: undefined });
    useNavigate.mockReturnValue(jest.fn());
    useToast.mockReturnValue({ toast });
    useSettings.mockReturnValue({ data: { unit_system: 'metric' } });
    useMeasurements.mockReturnValue({ data: [] });
    useQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });
    apiGet.mockResolvedValue([]);

    const workoutState = {
      isActive: false,
      startedAt: null,
      notes: '',
      setNotes: jest.fn(),
      startWorkout,
      finishWorkout: jest.fn(),
      resetWorkout: jest.fn(),
      cancelWorkout: jest.fn(),
      fetchPreviousData: jest.fn(),
      addExercise: jest.fn(),
      removeExercise: jest.fn(),
      addSet: jest.fn(),
      removeSet: jest.fn(),
      updateSet: jest.fn(),
      completeSet: jest.fn(),
      updateExerciseConfig: jest.fn(),
      exercises: [],
      totalVolume: () => 0,
      completedSetsCount: () => 0,
    };

    useWorkoutStore.mockImplementation((selector) => selector(workoutState));
    useRestTimerStore.mockImplementation((selector) =>
      selector({ restTimerRunning: false, restTimerEnd: null, stopRestTimer: jest.fn() })
    );

    render(<WorkoutPage />);

    // Wait for the empty state start prompt to map to our button component.
    await waitFor(() => {
      expect(screen.getByText('START EMPTY WORKOUT')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('START EMPTY WORKOUT'));

    expect(startWorkout).toHaveBeenCalledWith(null, 'Freestyle Workout', []);
    expect(toast).toHaveBeenCalledWith('info', 'Started Freestyle Workout');
  });

  test('renders active workout UI when isActive is true', async () => {
    useParams.mockReturnValue({ routineId: undefined });
    useNavigate.mockReturnValue(jest.fn());
    useToast.mockReturnValue({ toast: jest.fn() });
    useSettings.mockReturnValue({ data: { unit_system: 'metric' } });
    useMeasurements.mockReturnValue({ data: [] });
    useQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });
    
    // We already mocked WorkoutHeader and ExercisePicker components 
    // They will render as null, so let's mock WorkoutHeader specifically for this test
    // Actually we can just check if Add Exercise button is there since it's hardcoded
    
    const workoutState = {
      isActive: true,
      routineId: null,
      workoutName: 'Freestyle Workout',
      startedAt: new Date().toISOString(),
      notes: '',
      setNotes: jest.fn(),
      exercises: [],
      totalVolume: () => 0,
      completedSetsCount: () => 0,
    };
    useWorkoutStore.mockImplementation((selector) => selector(workoutState));
    useRestTimerStore.mockImplementation((selector) =>
      selector({ restTimerRunning: false, restTimerEnd: null, stopRestTimer: jest.fn() })
    );

    render(<WorkoutPage />);

    // Add Exercise is standard UI in the active workout
    await waitFor(() => {
      expect(screen.getByText('Add Exercise')).toBeInTheDocument();
    });
  });
});

