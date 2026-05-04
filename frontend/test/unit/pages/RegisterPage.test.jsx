// Unit tests for RegisterPage — initial account creation layout.
import { render, screen } from '@testing-library/react';
import RegisterPage from '../../../src/pages/RegisterPage';
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

jest.mock('../../../src/components/auth/RegisterForm', () => () => <div>RegisterForm</div>);

jest.mock('../../../src/stores/useThemeStore', () => ({
  useThemeStore: jest.fn(),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useThemeStore.mockReturnValue({ theme: 'light' });
  });

  test('renders register content and signin link', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    expect(screen.getByText('RegisterForm')).toBeInTheDocument();

    const signinLink = screen.getByRole('link', { name: 'Sign in' });
    expect(signinLink).toHaveAttribute('href', '/login');
  });

  test('uses light logo variant when theme is light', () => {
    render(<RegisterPage />);

    const logo = screen.getByAltText('MUSCLO');
    expect(logo).toHaveAttribute('src', '/logo.png');
  });
});

