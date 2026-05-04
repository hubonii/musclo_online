// Unit tests for Modal — portal rendering and overlay interactions.
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../../../../src/components/ui/Modal';

// Mock framer-motion AnimatePresence to avoid dealing with async animations in pure unit tests.
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Modal', () => {
  test('renders children when open is true', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getAllByText('Test Modal').length).toBeGreaterThan(0);
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  test('does not render when open is false', () => {
    render(
      <Modal open={false} onOpenChange={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  test('calls onOpenChange when close button is clicked', () => {
    const onOpenChange = jest.fn();
    render(
      <Modal open={true} onOpenChange={onOpenChange} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
