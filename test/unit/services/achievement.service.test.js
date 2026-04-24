// Unit tests for AchievementService — streaks and milestone unlock logic.
jest.mock('../../../models', () => ({
  Achievement: {
    findAll: jest.fn(),
  },
  WorkoutLog: {
    findAll: jest.fn(),
    count: jest.fn(),
    sum: jest.fn(),
  },
  SetData: {
    max: jest.fn(),
  },
  Exercise: {},
}));

jest.mock('../../../config/database', () => ({
  fn: jest.fn((name, col) => ({ name, col })),
  col: jest.fn((value) => value),
}));

const { Achievement, WorkoutLog, SetData } = require('../../../models');
const achievementService = require('../../../services/achievementService');

describe('AchievementService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('calculateStreak returns 0 when user has no completed workout days', async () => {
    WorkoutLog.findAll.mockResolvedValue([]);

    const streak = await achievementService.calculateStreak({ id: 7 });

    expect(streak).toBe(0);
  });

  test('calculateStreak counts consecutive workout days from today', async () => {
    const today = new Date();
    // Helper returns YYYY-MM-DD values expected by the service query output.
    const day = (offset) => {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      return d.toISOString().slice(0, 10);
    };

    WorkoutLog.findAll.mockResolvedValue([
      { workout_date: day(0) },
      { workout_date: day(1) },
      { workout_date: day(2) },
      { workout_date: day(4) },
    ]);

    const streak = await achievementService.calculateStreak({ id: 7 });

    expect(streak).toBe(3);
  });

  test('checkAchievements returns empty list when user already unlocked all achievements', async () => {
    const user = {
      id: 7,
      getAchievements: jest.fn().mockResolvedValue([{ id: 1 }]),
      addAchievement: jest.fn(),
    };
    const latestWorkoutLog = { getSetData: jest.fn() };
    Achievement.findAll.mockResolvedValue([]);

    const unlocked = await achievementService.checkAchievements(user, latestWorkoutLog, { id: 'tx-1' });

    expect(unlocked).toEqual([]);
    expect(user.addAchievement).not.toHaveBeenCalled();
    expect(latestWorkoutLog.getSetData).not.toHaveBeenCalled();
  });

  test('checkAchievements unlocks PR-weight achievement and writes pivot through transaction', async () => {
    const user = {
      id: 9,
      getAchievements: jest.fn().mockResolvedValue([]),
      addAchievement: jest.fn().mockResolvedValue(undefined),
    };

    const latestWorkoutLog = {
      started_at: '2026-04-18T06:00:00.000Z',
      getSetData: jest.fn().mockResolvedValue([
        { is_pr: true, Exercise: { name: 'Bench Press' } },
        { is_pr: false, Exercise: { name: 'Row' } },
      ]),
    };

    const achievement = {
      id: 22,
      criteria: {
        type: 'pr_weight',
        exercise_name: 'Bench Press',
        weight_gte: 100,
      },
    };

    Achievement.findAll.mockResolvedValue([achievement]);
    WorkoutLog.count.mockResolvedValue(12);
    WorkoutLog.sum.mockResolvedValue(55000);
    SetData.max.mockResolvedValue(120);
    jest.spyOn(achievementService, 'calculateStreak').mockResolvedValue(4);

    const transaction = { id: 'tx-2' };
    const unlocked = await achievementService.checkAchievements(user, latestWorkoutLog, transaction);

    expect(SetData.max).toHaveBeenCalled();
    expect(unlocked).toEqual([achievement]);
    expect(user.addAchievement).toHaveBeenCalledWith(
      achievement,
      expect.objectContaining({
        transaction,
        through: expect.objectContaining({ unlocked_at: expect.any(Date) }),
      })
    );
  });
});


