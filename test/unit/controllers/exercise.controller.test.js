// Unit tests for ExerciseController — searchable exercises and custom movements.
const { getExercises, getExercise, createExercise, toggleFavorite } = require('../../../controllers/exerciseController');
const { Exercise, User } = require('../../../models');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  Exercise: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    bodyPartIconUrl: jest.fn().mockReturnValue('/icon.png'),
    normalizeBodyPart: jest.fn(),
  },
  User: {}
}));



describe('ExerciseController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExercises', () => {
    test('returns paginated list with meta', async () => {
      Exercise.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: [{ id: 1, name: 'Squat', toJSON: () => ({ id: 1, name: 'Squat' }) }]
      });

      const req = { user: { id: 1 }, query: { page: 2, limit: 10 } };
      const res = createRes();

      await getExercises(req, res);

      expect(Exercise.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 10 })
      );
      expect(res.json).toHaveBeenCalledWith({
        data: expect.any(Array),
        meta: { current_page: 2, per_page: 10, total: 50, last_page: 5 }
      });
    });

    test('returns 500 on database error', async () => {
      Exercise.findAndCountAll.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, query: {} };
      const res = createRes();

      await getExercises(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('getExercise', () => {
    test('returns 404 for non-existent exercise', async () => {
      Exercise.findByPk.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: 99 } };
      const res = createRes();

      await getExercise(req, res);

      expect(Exercise.findByPk).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Exercise not found' });
    });

    test('returns 403 for another user\'s custom exercise', async () => {
      const mockExercise = { id: 99, is_custom: true, user_id: 2 };
      Exercise.findByPk.mockResolvedValue(mockExercise);

      const req = { user: { id: 1 }, params: { id: 99 } };
      const res = createRes();

      await getExercise(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    test('returns 500 on database error', async () => {
      Exercise.findByPk.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, params: { id: 1 } };
      const res = createRes();

      await getExercise(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('createExercise', () => {
    test('stores custom exercise with user_id', async () => {
      const mockExercise = { id: 100, name: 'Custom Lift', is_custom: true, toJSON: () => ({ id: 100, name: 'Custom Lift' }) };
      Exercise.create.mockResolvedValue(mockExercise);

      const req = {
        user: { id: 1 },
        body: { name: 'Custom Lift', category: 'strength' }
      };
      const res = createRes();

      await createExercise(req, res);

      expect(Exercise.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Custom Lift',
        is_custom: true,
        user_id: 1,
        category: 'strength'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: expect.any(Object) });
    });
  });

  describe('toggleFavorite', () => {
    test('adds and removes favorite', async () => {
      const mockUser = {
        id: 1,
        hasFavoriteExercise: jest.fn().mockResolvedValue(true),
        removeFavoriteExercise: jest.fn().mockResolvedValue(),
        addFavoriteExercise: jest.fn().mockResolvedValue(),
      };
      const mockExercise = { id: 10 };
      Exercise.findByPk.mockResolvedValue(mockExercise);

      const req = { user: mockUser, params: { exerciseId: 10 } };
      let res = createRes();

      // Case 1: Currently favorited -> Removes favorite
      await toggleFavorite(req, res);
      expect(mockUser.hasFavoriteExercise).toHaveBeenCalledWith(mockExercise);
      expect(mockUser.removeFavoriteExercise).toHaveBeenCalledWith(mockExercise);
      expect(res.json).toHaveBeenCalledWith({ favorited: false, message: 'Removed from favorites' });

      // Case 2: Currently not favorited -> Adds favorite
      mockUser.hasFavoriteExercise.mockResolvedValue(false);
      res = createRes();
      await toggleFavorite(req, res);
      expect(mockUser.addFavoriteExercise).toHaveBeenCalledWith(mockExercise);
      expect(res.json).toHaveBeenCalledWith({ favorited: true, message: 'Added to favorites' });
    });
  });
});
