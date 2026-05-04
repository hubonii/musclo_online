// Unit tests for ProgramController — long-term training plans and schedules.
const { createProgram, getProgram, updateProgram, deleteProgram, addRoutineToProgram } = require('../../../controllers/programController');
const { Program, Routine } = require('../../../models');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  Program: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Routine: {
    create: jest.fn(),
  },
  Exercise: {},
  SetData: {}
}));



describe('ProgramController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProgram', () => {
    test('creates and returns 201 with transformed shape', async () => {
      const mockProgram = { id: 10, name: 'New Program', is_active: false, toJSON: () => ({ id: 10, name: 'New Program' }) };
      Program.create.mockResolvedValue(mockProgram);

      const req = {
        user: { id: 1 },
        body: { name: 'New Program', description: 'desc', is_active: false }
      };
      const res = createRes();

      await createProgram(req, res);

      expect(Program.create).toHaveBeenCalledWith({
        name: 'New Program',
        description: 'desc',
        is_active: false,
        user_id: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: expect.objectContaining({ id: 10, name: 'New Program' }) });
    });
  });

  describe('getProgram', () => {
    test('returns 404 when not found', async () => {
      Program.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: 99 } };
      const res = createRes();

      await getProgram(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Program not found' });
      expect(Program.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 99, user_id: 1 } }));
    });

    test('returns 500 on database error', async () => {
      Program.findOne.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, params: { id: 1 } };
      const res = createRes();

      await getProgram(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('updateProgram', () => {
    test('updates fields and returns updated data', async () => {
      const mockProgram = { id: 10, name: 'Old Program', update: jest.fn().mockResolvedValue(), toJSON: () => ({ id: 10, name: 'Updated Program' }) };
      Program.findOne.mockResolvedValue(mockProgram);

      const req = { user: { id: 1 }, params: { id: 10 }, body: { name: 'Updated Program' } };
      const res = createRes();

      await updateProgram(req, res);

      expect(Program.findOne).toHaveBeenCalledWith({ where: { id: 10, user_id: 1 } });
      expect(mockProgram.update).toHaveBeenCalledWith({ name: 'Updated Program' });
      expect(res.json).toHaveBeenCalledWith({ data: expect.objectContaining({ name: 'Updated Program' }) });
    });
  });

  describe('deleteProgram', () => {
    test('returns success message on valid delete', async () => {
      const mockProgram = { id: 10, destroy: jest.fn().mockResolvedValue() };
      Program.findOne.mockResolvedValue(mockProgram);

      const req = { user: { id: 1 }, params: { id: 10 } };
      const res = createRes();

      await deleteProgram(req, res);

      expect(Program.findOne).toHaveBeenCalledWith({ where: { id: 10, user_id: 1 } });
      expect(mockProgram.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Program deleted successfully.' });
    });

    test('returns 500 on database error', async () => {
      Program.findOne.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, params: { id: 1 } };
      const res = createRes();

      await deleteProgram(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('addRoutineToProgram', () => {
    test('returns 404 for non-existent program', async () => {
      Program.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: 99 }, body: { name: 'New Routine' } };
      const res = createRes();

      await addRoutineToProgram(req, res);

      expect(Program.findOne).toHaveBeenCalledWith({ where: { id: 99, user_id: 1 } });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Program not found' });
    });
  });
});
