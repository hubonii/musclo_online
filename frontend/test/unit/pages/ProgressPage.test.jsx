// Unit tests for ProgressPage — metrics aggregation and visual session cards.
import { render, screen, fireEvent } from '@testing-library/react';
import ProgressPage from '../../../src/pages/ProgressPage';
import { useProgressPageData } from '../../../src/hooks/useProgressPageData';

// --- Library & Motion Mocks ---
jest.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({
  Image: () => null,
}));

jest.mock('../../../src/lib/motion', () => ({ MOTION: { pageEnter: {} } }));

// --- State & Hook Mocks ---
jest.mock('../../../src/hooks/useProgressPageData', () => ({
  useProgressPageData: jest.fn(),
}));

// --- UI Component Mocks ---
jest.mock('../../../src/components/ui/Card', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children }) => <button>{children}</button>,
}));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: ({ message }) => <div>{message || 'loading'}</div>,
}));

// --- Domain Component Mocks ---
jest.mock('../../../src/components/progress/MeasurementAccordion', () => ({
  __esModule: true,
  default: () => <div>MeasurementAccordion</div>,
}));

jest.mock('../../../src/components/progress/UploadSessionHeader', () => ({
  __esModule: true,
  default: ({ onUploadClick }) => <button onClick={onUploadClick}>Upload Header</button>,
}));

jest.mock('../../../src/components/progress/ProgressSessionCard', () => ({
  __esModule: true,
  default: ({ date, onDeletePhoto }) => (
    <button onClick={() => onDeletePhoto(12)}>Session {date}</button>
  ),
}));

describe('ProgressPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    useProgressPageData.mockReturnValue({ isLoading: true });

    render(<ProgressPage />);

    expect(screen.getByText('Loading your progress...')).toBeInTheDocument();
  });

  test('renders empty state when there are no sessions', () => {
    useProgressPageData.mockReturnValue({
      measurements: [],
      isLoading: false,
      isMeasurementsOpen: false,
      setIsMeasurementsOpen: jest.fn(),
      selectedUploadPose: 'front',
      setSelectedUploadPose: jest.fn(),
      measurementForm: {},
      setMeasurementForm: jest.fn(),
      fileInputRef: { current: null },
      isAddingMeasurement: false,
      isUpdatingMeasurement: false,
      isUploadingPhoto: false,
      handleSaveMeasurements: jest.fn(),
      handleFileChange: jest.fn(),
      handleDeletePhoto: jest.fn(),
      sessionsByDate: {},
      sortedDates: [],
    });

    render(<ProgressPage />);

    expect(screen.getByText('No photos yet')).toBeInTheDocument();
  });

  test('renders session cards and forwards delete handler', () => {
    const handleDeletePhoto = jest.fn();

    useProgressPageData.mockReturnValue({
      measurements: [{ id: 1, date: '2026-04-13' }],
      isLoading: false,
      isMeasurementsOpen: false,
      setIsMeasurementsOpen: jest.fn(),
      selectedUploadPose: 'front',
      setSelectedUploadPose: jest.fn(),
      measurementForm: {},
      setMeasurementForm: jest.fn(),
      fileInputRef: { current: null },
      isAddingMeasurement: false,
      isUpdatingMeasurement: false,
      isUploadingPhoto: false,
      handleSaveMeasurements: jest.fn(),
      handleFileChange: jest.fn(),
      handleDeletePhoto,
      sessionsByDate: {
        '2026-04-13': { measurement_id: 1, photos: [{ id: 12 }] },
      },
      sortedDates: ['2026-04-13'],
    });

    render(<ProgressPage />);

    fireEvent.click(screen.getByText('Session 2026-04-13'));
    expect(handleDeletePhoto).toHaveBeenCalledWith(12);
  });
});


