import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ProfilePage from '../../../src/pages/ProfilePage';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { useAchievements, useProfile, useSharedWorkouts } from '../../../src/hooks/useProfile';
import { useThemeStore } from '../../../src/stores/useThemeStore';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../../src/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../src/hooks/useProfile', () => ({
  useProfile: jest.fn(),
  useAchievements: jest.fn(),
  useSharedWorkouts: jest.fn(),
}));

jest.mock('../../../src/stores/useThemeStore', () => ({
  useThemeStore: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

jest.mock('lucide-react', () => ({
  User: () => null,
  Trophy: () => null,
  Share2: () => null,
  Dumbbell: () => null,
  CalendarDays: () => null,
  TrendingUp: () => null,
  Settings: () => null,
  Lock: () => null,
  Camera: () => null,
  Sun: () => null,
  Moon: () => null,
  LogOut: () => null,
}));

jest.mock('../../../src/components/ui/Card', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('../../../src/components/ui/Avatar', () => ({
  __esModule: true,
  default: ({ name }) => <div>Avatar {name}</div>,
}));

jest.mock('../../../src/components/profile/AchievementBadge', () => ({ name }) => (
  <div>Achievement {name}</div>
));

jest.mock('../../../src/components/ui/LoadingSpinner', () => ({ message }) => <div>{message}</div>);

describe('ProfilePage', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(navigate);
    useParams.mockReturnValue({});
    useAuthStore.mockImplementation((selector) => {
      const state = { user: { id: 42 }, logout: jest.fn() };
      return typeof selector === 'function' ? selector(state) : state;
    });
    useThemeStore.mockImplementation((selector) => {
      const state = { theme: 'dark', toggleTheme: jest.fn() };
      return typeof selector === 'function' ? selector(state) : state;
    });
    useAchievements.mockReturnValue({ data: [], isLoading: false });
    useSharedWorkouts.mockReturnValue({ data: [], isLoading: false });
  });

  test('shows loading state while profile query is pending', () => {
    useProfile.mockReturnValue({ data: null, isLoading: true });

    render(<ProfilePage />);

    expect(screen.getByText(/Preparing your profile/i)).toBeInTheDocument();
  });

  test('shows not-found state when profile data is empty', () => {
    useProfile.mockReturnValue({ data: null, isLoading: false });

    render(<ProfilePage />);

    expect(screen.getByText('Profile not found.')).toBeInTheDocument();
  });

  test('renders profile and allows owner to navigate to settings', () => {
    useProfile.mockReturnValue({
      isLoading: false,
      data: {
        id: 42,
        name: 'Athlete',
        username: 'athlete123',
        bio: 'Consistency wins.',
        stats: { total_workouts: 12, total_volume: 12000, current_streak: 4 },
      },
    });

    render(<ProfilePage />);

    expect(screen.getByText('Athlete')).toBeInTheDocument();
    expect(screen.getByText('@athlete123')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Account Settings/i }));
    expect(navigate).toHaveBeenCalledWith('/settings');
  });
});
