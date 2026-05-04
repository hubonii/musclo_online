// Unit tests for ProfilePage — loading states and transformation gallery.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ProfilePage from '../../../src/pages/ProfilePage';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { useAchievements, useProfile, useSharedWorkouts } from '../../../src/hooks/useProfile';

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
}));

jest.mock('../../../src/components/ui/Card', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../../src/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('../../../src/components/profile/LevelBadge', () => () => <div>LevelBadge</div>);
jest.mock('../../../src/components/profile/AchievementBadge', () => ({ achievement }) => (
  <div>Achievement {achievement.id}</div>
));
jest.mock('../../../src/components/ui/LoadingSpinner', () => () => <div>Loading profile...</div>);

describe('ProfilePage', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(navigate);
    useParams.mockReturnValue({});
    useAuthStore.mockImplementation((selector) => selector({ user: { id: 42 } }));
    useAchievements.mockReturnValue({ data: [], isLoading: false });
    useSharedWorkouts.mockReturnValue({ data: [], isLoading: false });
  });

  test('shows loading state while profile query is pending', () => {
    useProfile.mockReturnValue({ data: null, isLoading: true });

    render(<ProfilePage />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
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
        bio: 'Consistency wins.',
        level: { number: 3, title: 'Intermediate', progress: 67 },
        stats: { total_workouts: 12, total_volume: 12000, current_streak: 4 },
      },
    });

    render(<ProfilePage />);

    expect(screen.getByText('Athlete')).toBeInTheDocument();
    expect(screen.getByText('Trophy Cabinet')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    expect(navigate).toHaveBeenCalledWith('/settings');
  });
});

