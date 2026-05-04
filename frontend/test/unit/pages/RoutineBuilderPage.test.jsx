// Unit tests for RoutineBuilderPage — layout composition and sidebar toggles.
import { render, screen, fireEvent } from '@testing-library/react';
import RoutineBuilderPage from '../../../src/pages/RoutineBuilderPage';
import { useRoutineBuilder } from '../../../src/hooks/useRoutineBuilder';

// --- Library & Motion Mocks ---
jest.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({ Plus: () => null, X: () => null }));

// --- State & Hook Mocks ---
jest.mock('../../../src/hooks/useRoutineBuilder', () => ({ useRoutineBuilder: jest.fn() }));

// --- UI Component Mocks ---
jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({ __esModule: true, default: () => <div>Loading Spinner</div> }));

// --- Domain Component Mocks ---
jest.mock('../../../src/components/routines/ExercisePicker', () => ({ __esModule: true, default: () => <div>ExercisePicker</div> }));
jest.mock('../../../src/components/routines/BuilderHeader', () => ({ __esModule: true, default: () => <div>BuilderHeader</div> }));
jest.mock('../../../src/components/routines/RoutineConfigCard', () => ({ __esModule: true, default: () => <div>RoutineConfigCard</div> }));
jest.mock('../../../src/components/routines/RoutineExerciseItem', () => ({ __esModule: true, default: () => <div>RoutineExerciseItem</div> }));

describe('RoutineBuilderPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    useRoutineBuilder.mockReturnValue({ loading: true });

    render(<RoutineBuilderPage />);

    expect(screen.getByText('Loading Spinner')).toBeInTheDocument();
  });

  test('renders builder and opens mobile library', () => {
    const setShowMobileLibrary = jest.fn();

    useRoutineBuilder.mockReturnValue({
      isNew: true,
      programId: '5',
      programName: 'Program X',
      routineName: 'Routine A',
      setRoutineName: jest.fn(),
      notes: '',
      setNotes: jest.fn(),
      dayOfWeek: 1,
      setDayOfWeek: jest.fn(),
      exercises: [{ _uiId: '1' }],
      isSaving: false,
      loading: false,
      showMobileLibrary: false,
      setShowMobileLibrary,
      handleAddExercise: jest.fn(),
      handleRemoveExercise: jest.fn(),
      addSet: jest.fn(),
      removeSet: jest.fn(),
      updateSet: jest.fn(),
      updateExerciseParam: jest.fn(),
      toggleExpand: jest.fn(),
      handleSave: jest.fn(),
      navigate: jest.fn(),
    });

    render(<RoutineBuilderPage />);

    expect(screen.getByText('BuilderHeader')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));

    expect(setShowMobileLibrary).toHaveBeenCalledWith(true);
  });
});


