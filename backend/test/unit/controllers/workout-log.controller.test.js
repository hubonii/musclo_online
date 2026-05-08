
const { storeWorkout, getHistory, getWorkout, deleteWorkout, getExerciseHistory } = require('../../../controllers/workoutLogController');
const { WorkoutLog, SetData } = require('../../../models');
const sequelize = require('../../../config/database');
const { Op } = require('sequelize');
const { createRes } = require('../../helpers/express');


jest.mock('../../../models', () => ({
  WorkoutLog: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
  SetData: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Exercise: {},
  Routine: {}
}));

jest.mock('../../../config/database', () => ({
  transaction: jest.fn(),
  fn: jest.fn(),
  literal: jest.fn(),
}));

describe('WorkoutLogController', () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('storeWorkout', () => {
    test('creates a workout log with sets and returns 201', async () => {
      const mockWorkoutLog = {
        id: 10,
        update: jest.fn(),
      };
      WorkoutLog.create.mockResolvedValue(mockWorkoutLog);
      
      const mockSet = {
        id: 100,
        set_type: 'working',
        weight_kg: 50,
        reps: 10,
        update: jest.fn(),
      };
      SetData.create.mockResolvedValue(mockSet);
      SetData.findOne.mockResolvedValue(null); // No previous PR
      
      WorkoutLog.findByPk.mockResolvedValue({ id: 10, toJSON: () => ({ id: 10, name: 'Store Test' }) });

      const req = {
        user: { id: 1 },
        body: {
          routine_id: null,
          name: 'Store Test',
          sets: [{ exercise_id: 5, set_type: 'working', weight_kg: 50, reps: 10 }]
        }
      };
      const res = createRes();

      await storeWorkout(req, res);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(WorkoutLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 1, name: 'Store Test' }),
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(SetData.create).toHaveBeenCalledWith(
        expect.objectContaining({ workout_log_id: 10, exercise_id: 5 }),
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('rolls back on error and returns 500', async () => {
      WorkoutLog.create.mockRejectedValue(new Error('DB Error'));

      const req = { user: { id: 1 }, body: { sets: [] } };
      const res = createRes();

      await storeWorkout(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('getHistory', () => {
    test('returns paginated workout list', async () => {
      WorkoutLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 5, toJSON: () => ({ id: 5, name: 'Leg Day' }) }]
      });

      const req = { user: { id: 1 }, query: { page: 1, per_page: 10 } };
      const res = createRes();

      await getHistory(req, res);

      expect(WorkoutLog.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 1 },
          limit: 10,
          offset: 0
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        data: expect.any(Array),
        meta: {
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1
        }
      });
    });

    test('returns 500 on database error', async () => {
      WorkoutLog.findAndCountAll.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, query: {} };
      const res = createRes();

      await getHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('getWorkout', () => {
    test('returns 404 when workout not found', async () => {
      WorkoutLog.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: 99 } };
      const res = createRes();

      await getWorkout(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Workout not found' });
    });

    test('returns 500 on database error', async () => {
      WorkoutLog.findOne.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, params: { id: 1 } };
      const res = createRes();

      await getWorkout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('deleteWorkout', () => {
    test('removes workout and returns 204', async () => {
      const mockWorkoutLog = {
        id: 7,
        destroy: jest.fn().mockResolvedValue()
      };
      WorkoutLog.findOne.mockResolvedValue(mockWorkoutLog);

      const req = { user: { id: 1 }, params: { id: 7 } };
      const res = createRes();

      await deleteWorkout(req, res);

      expect(WorkoutLog.findOne).toHaveBeenCalledWith({ where: { id: 7, user_id: 1 } });
      expect(mockWorkoutLog.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('getExerciseHistory', () => {
    test('returns sets grouped by workout log id', async () => {
      SetData.findAll.mockResolvedValue([
        { workout_log_id: 100, id: 1 },
        { workout_log_id: 100, id: 2 },
        { workout_log_id: 101, id: 3 },
      ]);

      const req = { user: { id: 1 }, params: { exerciseId: 44 }, query: {} };
      const res = createRes();

      await getExerciseHistory(req, res);

      expect(SetData.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        data: {
          100: [{ workout_log_id: 100, id: 1 }, { workout_log_id: 100, id: 2 }],
          101: [{ workout_log_id: 101, id: 3 }],
        }
      });
    });
  });
});
