// Unit tests for ConfirmDialog — interactive confirmation flows.
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../../../../src/components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  test('renders message and buttons', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Item"
        description="Are you sure?"
        onOpenChange={() => {}}
        onConfirm={() => {}}
      />
    );
    
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  test('calls onConfirm when confirm is clicked', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={onConfirm}
        onOpenChange={() => {}}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  test('calls onOpenChange with false when cancel is clicked', () => {
    const onOpenChange = jest.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={() => {}}
        onOpenChange={onOpenChange}
      />
    );
    
    // Radix Alert Dialog cancel button normally triggers onOpenChange(false)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
