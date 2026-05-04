// Unit tests for BottomNav — mobile navigation and active route styling.
import { render, screen } from '@testing-library/react';
import BottomNav from '../../../../src/components/layout/BottomNav';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
  NavLink: ({ children, to }) => <a href={to}>{typeof children === 'function' ? children({ isActive: false }) : children}</a>,
}));

jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="icon-dashboard" />,
  Dumbbell: () => <div data-testid="icon-workout" />,
  Calendar: () => <div data-testid="icon-programs" />,
  History: () => <div data-testid="icon-history" />,
  TrendingUp: () => <div data-testid="icon-progress" />,
}));

describe('BottomNav', () => {
  test('renders all navigation icons', () => {
    render(<BottomNav />);

    expect(screen.getByTestId('icon-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('icon-workout')).toBeInTheDocument();
    expect(screen.getByTestId('icon-programs')).toBeInTheDocument();
    expect(screen.getByTestId('icon-progress')).toBeInTheDocument();
    expect(screen.getByTestId('icon-history')).toBeInTheDocument();
  });
});
