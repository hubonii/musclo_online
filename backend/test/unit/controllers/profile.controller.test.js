// Unit tests for ProfileController — user level, stats, and achievements.
const { getProfile, updateProfile, getAchievements } = require('../../../controllers/profileController');
const { User, WorkoutLog, Achievement, Routine } = require('../../../models');
const achievementService = require('../../../services/achievementService');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn(),
  },
  WorkoutLog: {
    count: jest.fn(),
    sum: jest.fn(),
  },
  Achievement: {
    findAll: jest.fn(),
  },
  Routine: {
    findAll: jest.fn(),
  }
}));

jest.mock('../../../services/achievementService', () => ({
  calculateStreak: jest.fn(),
}));



describe('ProfileController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    test('returns stats with level for own profile', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      User.findByPk.mockResolvedValue(mockUser);
      WorkoutLog.count.mockResolvedValue(10);
      WorkoutLog.sum.mockResolvedValue(20000); // Should be Intermediate (level > 5)
      achievementService.calculateStreak.mockResolvedValue(5);

      const req = { user: { id: 1 }, params: { userId: 'me' } };
      const res = createRes();

      await getProfile(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(WorkoutLog.count).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 1,
          email: 'john@example.com',
          level: expect.objectContaining({ title: 'Intermediate' }),
          stats: {
            total_workouts: 10,
            total_volume: 20000,
            current_streak: 5
          }
        })
      });
    });

    test('returns 403 for non-owned profile', async () => {
      const mockUser = { id: 2 };
      User.findByPk.mockResolvedValue(mockUser);

      const req = { user: { id: 1 }, params: { userId: 2 } };
      const res = createRes();

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied.' });
    });

    test('returns 500 on database error', async () => {
      User.findByPk.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, params: { userId: 2 } };
      const res = createRes();

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('updateProfile', () => {
    test('updates bio/name and returns updated data', async () => {
      const mockUser = {
        id: 1,
        name: 'Old Name',
        update: jest.fn().mockResolvedValue(),
      };
      // Emulate the updated user object shape
      const req = {
        user: { ...mockUser, name: 'New Name' },
        body: { name: 'New Name', bio: 'New Bio' }
      };
      req.user.update = jest.fn().mockImplementation(() => {
        req.user.name = 'New Name';
        req.user.bio = 'New Bio';
        return Promise.resolve();
      });

      const res = createRes();

      await updateProfile(req, res);

      expect(req.user.update).toHaveBeenCalledWith({ name: 'New Name', bio: 'New Bio' });
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'New Name', bio: 'New Bio' })
      });
    });
  });

  describe('getAchievements', () => {
    test('merges unlocked state into full list', async () => {
      const mockUser = {
        id: 1,
        getAchievements: jest.fn().mockResolvedValue([
          { id: 10, UserAchievement: { unlocked_at: '2023-01-01' } }
        ])
      };
      User.findByPk.mockResolvedValue(mockUser);
      
      Achievement.findAll.mockResolvedValue([
        { id: 10, name: 'First Workout', toJSON: () => ({ id: 10, name: 'First Workout' }) },
        { id: 20, name: 'Marathon', toJSON: () => ({ id: 20, name: 'Marathon' }) }
      ]);

      const req = { user: { id: 1 }, params: { userId: 'me' } };
      const res = createRes();

      await getAchievements(req, res);

      expect(res.json).toHaveBeenCalledWith({
        data: [
          { id: 10, name: 'First Workout', unlocked: true, unlocked_at: '2023-01-01' },
          { id: 20, name: 'Marathon', unlocked: false, unlocked_at: null }
        ]
      });
    });
  });
});
