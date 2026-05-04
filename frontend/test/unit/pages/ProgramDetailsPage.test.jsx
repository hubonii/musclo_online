// Unit tests for ProgramDetailsPage — routine lists and dashboard configuration.
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramDetailsPage from '../../../src/pages/ProgramDetailsPage';
import { useNavigate } from 'react-router-dom';
import { useProgramDetailsData } from '../../../src/hooks/useProgramDetailsData';

// --- Routing & Library Mocks ---
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));

jest.mock('framer-motion', () => ({ AnimatePresence: ({ children }) => <>{children}</> }));
jest.mock('lucide-react', () => ({ Search: () => null, ChevronRight: () => null, Dumbbell: () => null }));

// --- State & Data Hook Mocks ---
jest.mock('../../../src/hooks/useProgramDetailsData', () => ({ useProgramDetailsData: jest.fn() }));

// --- UI Component Mocks ---
jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('../../../src/components/ui/Input', () => ({
  __esModule: true,
  default: ({ value, onChange }) => <input value={value} onChange={onChange} placeholder="Search workouts..." />,
}));

jest.mock('../../../src/components/ui/EmptyState', () => ({
  __esModule: true,
  default: ({ title }) => <div>{title}</div>,
}));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({ __esModule: true, default: () => <div>Loading Spinner</div> }));
jest.mock('../../../src/components/ui/ConfirmDialog', () => ({ __esModule: true, default: () => null }));

// --- Domain Component Mocks ---
jest.mock('../../../src/components/programs/RoutineCard', () => ({
  __esModule: true,
  default: ({ routine, onLog }) => <button onClick={onLog}>{routine.name}</button>,
}));
jest.mock('../../../src/components/programs/ProgramBreakdown', () => ({ __esModule: true, default: () => <div>ProgramBreakdown</div> }));

describe('ProgramDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('navigates to build workout and renders routines list', () => {
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);

    useProgramDetailsData.mockReturnValue({
      programId: '5',
      program: { id: 5, name: 'Main Program', description: 'desc' },
      routines: [{ id: 1, name: 'Push A' }],
      loading: false,
      search: '',
      setSearch: jest.fn(),
      filteredWorkouts: [{ id: 1, name: 'Push A' }],
      deleteModalRoutine: null,
      setDeleteModalRoutine: jest.fn(),
      isDeleting: false,
      lastLogMap: {},
      handleDeleteRoutine: jest.fn(),
      totalExercises: 3,
    });

    render(<ProgramDetailsPage />);

    expect(screen.getAllByText('Main Program').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('+ Build Workout'));

    expect(navigate).toHaveBeenCalledWith('/programs/5/routines/new');
  });
});


