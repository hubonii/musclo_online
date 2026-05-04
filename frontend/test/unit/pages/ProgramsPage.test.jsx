// Unit tests for ProgramsPage — empty states and program creation payloads.
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramsPage from '../../../src/pages/ProgramsPage';
import { useNavigate } from 'react-router-dom';
import { usePrograms, useCreateProgram, useDeleteProgram } from '../../../src/hooks/usePrograms';

// --- Routing & Library Mocks ---
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

jest.mock('lucide-react', () => ({
  Plus: () => null,
  Folder: () => null,
}));

jest.mock('../../../src/lib/motion', () => ({
  MOTION: {
    staggerContainer: {},
  },
}));

// --- State & Data Hook Mocks ---
jest.mock('../../../src/hooks/usePrograms', () => ({
  usePrograms: jest.fn(),
  useCreateProgram: jest.fn(),
  useDeleteProgram: jest.fn(),
}));

// --- UI Component Mocks ---
jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, type = 'button', disabled }) => (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('../../../src/components/ui/Input', () => ({
  __esModule: true,
  default: (props) => <input aria-label="Program Name" {...props} />,
}));

jest.mock('../../../src/components/ui/Textarea', () => ({
  __esModule: true,
  default: (props) => <textarea aria-label="Description" {...props} />,
}));

jest.mock('../../../src/components/ui/Modal', () => ({
  __esModule: true,
  default: ({ open, children, title }) => (open ? <div><h2>{title}</h2>{children}</div> : null),
}));

jest.mock('../../../src/components/ui/EmptyState', () => ({
  __esModule: true,
  default: ({ title, description, action }) => (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  ),
}));

jest.mock('../../../src/components/ui/ConfirmDialog', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

// --- Domain Component Mocks ---
jest.mock('../../../src/components/programs/ProgramCard', () => ({
  __esModule: true,
  default: ({ program, onClick }) => <button onClick={onClick}>{program.name}</button>,
}));

describe('ProgramsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(jest.fn());
    useDeleteProgram.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  test('renders empty state when there are no programs', () => {
    usePrograms.mockReturnValue({ data: [], isLoading: false });
    useCreateProgram.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<ProgramsPage />);

    expect(screen.getByText('No Programs yet')).toBeInTheDocument();
    expect(screen.getByText('Create Program')).toBeInTheDocument();
  });

  test('creates program from modal form with trimmed payload', () => {
    const mutate = jest.fn();
    usePrograms.mockReturnValue({ data: [], isLoading: false });
    useCreateProgram.mockReturnValue({ mutate, isPending: false });

    render(<ProgramsPage />);

    fireEvent.click(screen.getByText('New Program'));

    fireEvent.change(screen.getByPlaceholderText('e.g., Summer Cut 2026'), {
      target: { value: '  Strength Block  ' },
    });
    fireEvent.change(screen.getByPlaceholderText("What's the main goal of this program?"), {
      target: { value: '  build base  ' },
    });

    fireEvent.click(screen.getByText('Save Program'));

    expect(mutate).toHaveBeenCalledWith(
      {
        name: 'Strength Block',
        description: 'build base',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  test('renders loading state when isLoading is true', () => {
    usePrograms.mockReturnValue({ data: [], isLoading: true });
    useCreateProgram.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<ProgramsPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});


