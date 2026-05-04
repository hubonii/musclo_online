// Contract tests for React Query key shapes and key segment order.
import { describe, test, expect } from '@jest/globals';
import { queryKeys } from '../../../src/api/queryKeys';

describe('queryKeys contract', () => {
  test('program detail key keeps stable shape', () => {
    expect(queryKeys.programs.detail(7)).toEqual(['programs', 7]);
  });

  test('workout and routine keys keep stable cache prefixes', () => {
    expect(queryKeys.workouts.history).toEqual(['workouts', 'history']);
    expect(queryKeys.workouts.detail(15)).toEqual(['workouts', 15]);
    expect(queryKeys.workouts.exerciseHistory(9)).toEqual(['workouts', 'exercise', 9, 'history']);
    expect(queryKeys.routines.lastLog(4)).toEqual(['routines', 4, 'last-log']);
  });

  test('exercise and profile keys include identity input values', () => {
    expect(queryKeys.exercises.search({ q: 'bench' })).toEqual(['exercises', { q: 'bench' }]);
    expect(queryKeys.exercises.filters).toEqual(['exercises', 'filters']);
    expect(queryKeys.profile.detail(2)).toEqual(['profile', 2]);
    expect(queryKeys.profile.achievements(2)).toEqual(['profile', 2, 'achievements']);
    expect(queryKeys.profile.routines(2)).toEqual(['profile', 2, 'routines']);
  });

  test('measurement, photo, settings and chat keys keep stable constants', () => {
    expect(queryKeys.measurements.all).toEqual(['measurements']);
    expect(queryKeys.progressPhotos.all).toEqual(['progress-photos']);
    expect(queryKeys.settings.all).toEqual(['settings']);
    expect(queryKeys.chat.sessions).toEqual(['chat', 'sessions']);
  });

  test('chat messages key keeps stable shape', () => {
    expect(queryKeys.chat.messages(12)).toEqual(['chat', 'sessions', 12, 'messages']);
  });
});


