// Unit tests for AnalyticsController — dashboards, charts, and volume heatmaps.
const { getStats, getProgression, getVolumeAnalytics, getCalendar } = require('../../../controllers/analyticsController');
const { WorkoutLog, SetData, Program, Routine, Exercise } = require('../../../models');
const sequelize = require('../../../config/database');
const { Op } = require('sequelize');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  WorkoutLog: {
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  SetData: {
    findAll: jest.fn(),
  },
  Program: {
    findAll: jest.fn(),
  },
  Routine: {
    findAll: jest.fn(),
  },
  Exercise: {}
}));

jest.mock('../../../config/database', () => ({
  fn: jest.fn(),
  col: jest.fn(),
  literal: jest.fn(),
  escape: jest.fn(val => `'${val}'`),
}));



describe('AnalyticsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    test('returns aggregated dashboard stats', async () => {
      // Aggregate metrics from WorkoutLog and recent activity from Program/Routine.
      WorkoutLog.findOne.mockResolvedValue({
        total: 10,
        this_week: 2,
        this_month: 5,
        total_kg: 5000,
        this_week_kg: 1000,
        total_seconds: 36000,
        this_week_seconds: 7200
      });
      
      const mockProgram = { id: 1, name: 'P1', Routines: [], toJSON: () => ({ id: 1, name: 'P1', Routines: [] }) };
      Program.findAll.mockResolvedValue([mockProgram]);
      
      const mockRoutine = { id: 2, name: 'R1', Exercises: [], toJSON: () => ({ id: 2, name: 'R1', Exercises: [] }) };
      Routine.findAll.mockResolvedValue([mockRoutine]);

      const req = { user: { id: 1 } };
      const res = createRes();

      await getStats(req, res);

      expect(WorkoutLog.findOne).toHaveBeenCalled();
      expect(Program.findAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 3 }));
      expect(Routine.findAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 3 }));
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workouts: { total: 10, this_week: 2, this_month: 5 },
          volume: { total_kg: 5000, this_week_kg: 1000 },
          time: { total_seconds: 36000, this_week_seconds: 7200 },
          recent_programs: expect.any(Array),
          recent_routines: expect.any(Array)
        })
      });
    });

    test('returns 500 on database error', async () => {
      WorkoutLog.findOne.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 } };
      const res = createRes();

      await getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('getProgression', () => {
    test('returns max volume per date for exercise charts', async () => {
      SetData.findAll.mockResolvedValue([
        { date: '2023-01-01', one_rep_max: 500 },
        { date: '2023-01-02', one_rep_max: 550 },
      ]);

      const req = { user: { id: 1 }, params: { exerciseId: 99 } };
      const res = createRes();

      await getProgression(req, res);

      expect(SetData.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { exercise_id: 99, is_completed: true }
      }));
      expect(res.json).toHaveBeenCalledWith({
        data: [
          { date: '2023-01-01', value: 500 },
          { date: '2023-01-02', value: 550 }
        ]
      });
    });
  });

  describe('getVolumeAnalytics', () => {
    test('groups total lifted volume by muscle', async () => {
      SetData.findAll.mockResolvedValue([
        { muscle: 'Chest', volume: 2000 },
        { muscle: 'Back', volume: 3000 }
      ]); // total = 5000

      const req = { user: { id: 1 }, query: { range: 'all' } };
      const res = createRes();

      await getVolumeAnalytics(req, res);

      expect(SetData.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          range: 'all',
          total_volume: 5000,
          muscles: [
            { muscle: 'chest', volume: 2000, percentage: 40 },
            { muscle: 'back', volume: 3000, percentage: 60 }
          ]
        })
      });
    });
  });

  describe('getCalendar', () => {
    test('returns one point per workout date', async () => {
      WorkoutLog.findAll.mockResolvedValue([
        { started_at: '2023-01-01', total_volume: 1000, duration_seconds: 3600 }
      ]);

      const req = { user: { id: 1 } };
      const res = createRes();

      await getCalendar(req, res);

      expect(WorkoutLog.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        data: [
          { date: '2023-01-01', volume: 1000, duration: 3600 }
        ]
      });
    });
  });
});
