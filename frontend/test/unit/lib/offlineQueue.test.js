import { getPendingWorkouts, queueWorkoutSave, flushQueue, getPendingCount } from '../../../src/lib/offlineQueue';
import { apiPost } from '../../../src/api/axios';

jest.mock('../../../src/api/axios', () => ({
  apiPost: jest.fn(),
}));

describe('Offline Queue Utility', () => {
  const userId = 1;
  const otherUserId = 2;
  const payload = { workout: 'test' };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('queueWorkoutSave stores item in localStorage with userId', () => {
    queueWorkoutSave(payload, userId);
    
    const pending = getPendingWorkouts(userId);
    expect(pending).toHaveLength(1);
    expect(pending[0].payload).toEqual(payload);
    expect(pending[0].userId).toBe(userId);
  });

  test('getPendingWorkouts filters items by userId', () => {
    queueWorkoutSave(payload, userId);
    queueWorkoutSave({ workout: 'other' }, otherUserId);
    
    const user1Pending = getPendingWorkouts(userId);
    const user2Pending = getPendingWorkouts(otherUserId);
    
    expect(user1Pending).toHaveLength(1);
    expect(user1Pending[0].userId).toBe(userId);
    expect(user2Pending).toHaveLength(1);
    expect(user2Pending[0].userId).toBe(otherUserId);
  });

  test('flushQueue syncs only current user items and removes them on success', async () => {
    queueWorkoutSave(payload, userId);
    queueWorkoutSave({ workout: 'other' }, otherUserId);
    
    apiPost.mockResolvedValue({ data: { success: true } });
    
    const result = await flushQueue(userId);
    
    expect(result.synced).toBe(1);
    expect(apiPost).toHaveBeenCalledWith('/workouts', payload);
    
    // User 1 queue should be empty, User 2 queue should remain
    expect(getPendingCount(userId)).toBe(0);
    expect(getPendingCount(otherUserId)).toBe(1);
  });

  test('flushQueue keeps failed items in queue for retry', async () => {
    queueWorkoutSave(payload, userId);
    apiPost.mockRejectedValue(new Error('Network error'));
    
    const result = await flushQueue(userId);
    
    expect(result.synced).toBe(0);
    expect(result.error).toBe('Network error');
    expect(getPendingCount(userId)).toBe(1);
  });
});
