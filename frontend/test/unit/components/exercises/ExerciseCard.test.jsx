// Unit tests for ExerciseCard — rendering and interactive search states.
import { render, screen, fireEvent } from '@testing-library/react';
import ExerciseCard from '../../../../src/components/exercises/ExerciseCard';

describe('ExerciseCard', () => {
  const mockExercise = {
    id: 1,
    name: 'Barbell Squat',
    muscle_group: 'Legs',
    equipment: 'Barbell'
  };

  test('renders exercise details correctly', () => {
    render(<ExerciseCard exercise={mockExercise} onClick={() => {}} />);
    
    expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    expect(screen.getByText('Legs')).toBeInTheDocument();
    expect(screen.getByText('Barbell')).toBeInTheDocument();
  });

  test('triggers onClick when clicked', () => {
    const onClick = jest.fn();
    render(<ExerciseCard exercise={mockExercise} onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Barbell Squat'));
    expect(onClick).toHaveBeenCalledWith(mockExercise);
  });
});
