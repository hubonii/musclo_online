// Unit tests for NotFoundPage — recovery links and 404 messaging.
import { render, screen } from '@testing-library/react';
import NotFoundPage from '../../../src/pages/NotFoundPage';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe('NotFoundPage', () => {
  test('renders 404 content with recovery link', () => {
    render(<NotFoundPage />);

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: 'Back to Dashboard' });
    expect(backLink).toHaveAttribute('href', '/dashboard');
  });
});

