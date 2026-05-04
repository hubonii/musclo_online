// Unit tests for RoutineController — manual and AI routine management.
const { createRoutine, getRoutine, deleteRoutine, getTodayRoutine } = require('../../../controllers/routineController');
const { Routine, Program, RoutineExercise, SetData } = require('../../../models');
const sequelize = require('../../../config/database');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  Routine: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
  Program: {
    findByPk: jest.fn(),
  },
  RoutineExercise: {
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  },
  SetData: {
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  },
  Exercise: {}
}));

jest.mock('../../../config/database', () => ({
  transaction: jest.fn(),
}));



describe('RoutineController', () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createRoutine', () => {
    test('returns 403 when program belongs to another user', async () => {
      Program.findByPk.mockResolvedValue({ id: 99, user_id: 2 }); // Requesting user is 1

      const req = { user: { id: 1 }, params: { programId: 99 }, body: {} };
      const res = createRes();

      await createRoutine(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('creates routine with exercises and returns 201', async () => {
      Program.findByPk.mockResolvedValue({ id: 99, user_id: 1 });
      
      const mockRoutine = { id: 10, name: 'New Routine' };
      Routine.create.mockResolvedValue(mockRoutine);
      Routine.findByPk.mockResolvedValue({ ...mockRoutine, toJSON: () => mockRoutine });

      const req = {
        user: { id: 1 },
        params: { programId: 99 },
        body: {
          name: 'New Routine',
          exercises: [{ id: 5, sort_order: 1 }]
        }
      };
      const res = createRes();

      await createRoutine(req, res);

      expect(Routine.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Routine', program_id: 99, user_id: 1 }),
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(RoutineExercise.bulkCreate).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getRoutine', () => {
    test('returns 404 when routine not found', async () => {
      Routine.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: 50 } };
      const res = createRes();

      await getRoutine(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Routine not found' });
    });

    test('returns 500 on database error', async () => {
      Routine.findOne.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, params: { id: 1 } };
      const res = createRes();

      await getRoutine(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('deleteRoutine', () => {
    test('destroys and returns 204', async () => {
      const mockRoutine = { id: 50, destroy: jest.fn().mockResolvedValue() };
      Routine.findOne.mockResolvedValue(mockRoutine);

      const req = { user: { id: 1 }, params: { id: 50 } };
      const res = createRes();

      await deleteRoutine(req, res);

      expect(Routine.findOne).toHaveBeenCalledWith({ where: { id: 50, user_id: 1 } });
      expect(mockRoutine.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('getTodayRoutine', () => {
    test('returns null when no routine matches today', async () => {
      Routine.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 } };
      const res = createRes();

      await getTodayRoutine(req, res);

      expect(res.json).toHaveBeenCalledWith({ data: null });
    });

    test('returns 500 on database error', async () => {
      Routine.findOne.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 } };
      const res = createRes();

      await getTodayRoutine(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });
});
