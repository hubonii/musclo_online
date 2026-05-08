// Unit tests for ProfileController — user level, stats, and achievements.
const { getProfile, updateProfile, getAchievements } = require('../../../controllers/profileController');
const { User, WorkoutLog, Achievement, Routine } = require('../../../models');
const achievementService = require('../../../services/achievementService');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
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
  },
  ProgressPhoto: {
    findAll: jest.fn(),
  },
  Exercise: {}
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
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', is_public: true };
      User.findByPk.mockResolvedValue(mockUser);
      WorkoutLog.count.mockResolvedValue(10);
      WorkoutLog.sum.mockResolvedValue(20000); 
      achievementService.calculateStreak.mockResolvedValue(5);

      const req = { user: { id: 1 }, params: { userId: 'me' } };
      const res = createRes();

      await getProfile(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 1,
          email: 'john@example.com',
        })
      });
    });

    test('returns 403 for private non-owned profile', async () => {
      const mockUser = { id: 2, is_public: false };
      User.findByPk.mockResolvedValue(mockUser);

      const req = { user: { id: 1 }, params: { userId: 2 } };
      const res = createRes();

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'This profile is private.' });
    });
  });

  describe('updateProfile', () => {
    test('updates profile and returns updated data', async () => {
      const mockUser = {
        id: 1,
        name: 'Old Name',
        email: 'old@example.com',
        bio: 'Old Bio',
        is_public: true,
        update: jest.fn().mockImplementation(function(data) {
          Object.assign(this, data);
          return Promise.resolve();
        }),
      };
      
      const req = {
        user: mockUser,
        body: { name: 'New Name', bio: 'New Bio' }
      };
      const res = createRes();

      await updateProfile(req, res);

      expect(mockUser.update).toHaveBeenCalled();
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
