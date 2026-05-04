// Unit tests for TodayWorkoutAlert — dynamic dashboard prompts.
import { render, screen, fireEvent } from '@testing-library/react';
import TodayWorkoutAlert from '../../../../src/components/dashboard/TodayWorkoutAlert';

describe('TodayWorkoutAlert', () => {
  const mockRoutine = {
    id: 1,
    name: 'Pull Day',
    notes: 'Heavy compound focus',
    exercises: [{ id: 1 }, { id: 2 }]
  };

  test('renders routine info and start button', () => {
    const onStart = jest.fn();
    render(<TodayWorkoutAlert routine={mockRoutine} onStart={onStart} />);
    
    expect(screen.getByText('Pull Day')).toBeInTheDocument();
    expect(screen.getByText('2 exercises listed')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button'));
    expect(onStart).toHaveBeenCalled();
  });
});
