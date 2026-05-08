import React from 'react';
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
import { useAuthStore } from '../../../src/stores/useAuthStore';

// --- Routing & Library Mocks ---
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: { 
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span> 
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({
  Play: () => null,
  Plus: () => null,
  StickyNote: () => null,
  X: () => null,
  Clock: () => null,
  ChevronRight: () => null,
}));

jest.mock('../../../src/lib/motion', () => ({ MOTION: { pageEnter: {} } }));

// --- API & State Store Mocks ---
jest.mock('../../../src/stores/useWorkoutStore', () => ({
  useWorkoutStore: jest.fn(),
}));

jest.mock('../../../src/stores/useRestTimerStore', () => ({
  useRestTimerStore: jest.fn(),
}));

jest.mock('../../../src/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
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
  default: ({ children, onClick, className }) => <button onClick={onClick} className={className}>{children}</button>,
}));

jest.mock('../../../src/components/ui/Textarea', () => ({
  __esModule: true,
  default: (props) => <textarea {...props} />,
}));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

jest.mock('../../../src/components/ui/Card', () => ({
  __esModule: true,
  default: ({ children, onClick, className }) => <div onClick={onClick} className={className}>{children}</div>,
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
    useAuthStore.mockImplementation((selector) => selector({ user: { id: 1 } }));
  });

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
      exercises: [],
    };

    useWorkoutStore.mockImplementation((selector) => selector(workoutState));
    useRestTimerStore.mockImplementation((selector) =>
      selector({ restTimerRunning: false, restTimerEnd: null, stopRestTimer: jest.fn() })
    );

    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByText(/QUICK WORKOUT/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/QUICK WORKOUT/i));

    expect(startWorkout).toHaveBeenCalledWith(null, 'Freestyle Workout', []);
  });

  test('renders active workout UI when isActive is true', async () => {
    useParams.mockReturnValue({ routineId: undefined });
    useNavigate.mockReturnValue(jest.fn());
    useToast.mockReturnValue({ toast: jest.fn() });
    useSettings.mockReturnValue({ data: { unit_system: 'metric' } });
    useMeasurements.mockReturnValue({ data: [] });
    useQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });
    
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

    await waitFor(() => {
      expect(screen.getByText(/ADD EXERCISE/i)).toBeInTheDocument();
    });
  });
});
