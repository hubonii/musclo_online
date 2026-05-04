// Unit tests for utility helpers used across frontend pages/components.
import {
  calculateCompletedSetsCount,
  calculateTotalSetsCount,
  calculateTotalVolume,
  cn,
  formatDuration,
  formatWeight,
  groupPhotosByDate,
} from '../../../src/lib/utils';

describe('lib/utils', () => {
  test('merges class names with tailwind conflict resolution', () => {
    expect(cn('p-2', 'p-4', 'text-sm')).toBe('p-4 text-sm');
  });

  test('formats weights for metric and imperial output', () => {
    expect(formatWeight(80)).toBe('80 kg');
    expect(formatWeight(80, 'lbs')).toBe('176.4 lbs');
  });

  test('formats duration into human readable labels', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(125)).toBe('2m 5s');
    expect(formatDuration(3720)).toBe('1h 2m');
  });

  test('calculates workout totals with warmups excluded from volume', () => {
    const exercises = [
      {
        sets: [
          { isCompleted: true, set_type: 'working', weight_kg: 100, reps: 5 },
          { isCompleted: true, set_type: 'warmup', weight_kg: 40, reps: 10 },
          { isCompleted: false, set_type: 'working', weight_kg: 110, reps: 3 },
        ],
      },
      {
        sets: [
          { isCompleted: true, set_type: 'working', weight_kg: 60, reps: 8 },
        ],
      },
    ];

    expect(calculateTotalVolume(exercises)).toBe(980);
    expect(calculateCompletedSetsCount(exercises)).toBe(3);
    expect(calculateTotalSetsCount(exercises)).toBe(4);
  });

  test('groups progress photos by date and keeps newest dates first', () => {
    const photos = [
      { id: 1, pose: 'front', taken_at: '2026-04-18T10:00:00.000Z', measurement_id: 4 },
      { id: 2, pose: 'back', taken_at: '2026-04-18T11:00:00.000Z', measurement_id: null },
      { id: 3, pose: 'front', taken_at: '2026-04-17T10:00:00.000Z', measurement_id: 2 },
      { id: 4, pose: 'other_pose', taken_at: '2026-04-18T12:00:00.000Z', measurement_id: null },
    ];

    const { sessionsByDate, sortedDates } = groupPhotosByDate(photos);

    expect(sortedDates[0]).toBe('2026-04-18');
    expect(sortedDates[1]).toBe('2026-04-17');
    expect(sessionsByDate['2026-04-18'].front.id).toBe(1);
    expect(sessionsByDate['2026-04-18'].back.id).toBe(2);
    expect(sessionsByDate['2026-04-18'].other).toHaveLength(1);
    expect(sessionsByDate['2026-04-18'].measurement_id).toBe(4);
  });
});

