// Unit tests for LoginPage — composition and theme-based branding.
import { render, screen } from '@testing-library/react';
import LoginPage from '../../../src/pages/LoginPage';
import { useThemeStore } from '../../../src/stores/useThemeStore';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

jest.mock('../../../src/components/auth/LoginForm', () => () => <div>LoginForm</div>);

jest.mock('../../../src/stores/useThemeStore', () => ({
  useThemeStore: jest.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useThemeStore.mockReturnValue({ theme: 'dark' });
  });

  test('renders login content and signup link', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByText('LoginForm')).toBeInTheDocument();

    const signupLink = screen.getByRole('link', { name: 'Sign up' });
    expect(signupLink).toHaveAttribute('href', '/register');
  });

  test('uses dark logo variant when theme is dark', () => {
    render(<LoginPage />);

    const logo = screen.getByAltText('MUSCLO');
    expect(logo).toHaveAttribute('src', '/logo-dark.png');
  });
});

