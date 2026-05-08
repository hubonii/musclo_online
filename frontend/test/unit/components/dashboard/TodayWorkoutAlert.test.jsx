import React from 'react';
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
    expect(screen.getByText(/2 Exercises/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Start Workout/i }));
    expect(onStart).toHaveBeenCalled();
  });
});
