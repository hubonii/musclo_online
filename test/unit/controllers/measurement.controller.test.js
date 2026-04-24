// Unit tests for MeasurementController — body weight and metric tracking.
const { getMeasurements, createMeasurement, updateMeasurement, deleteMeasurement } = require('../../../controllers/measurementController');
const { Measurement } = require('../../../models');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  Measurement: {
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  }
}));



describe('MeasurementController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMeasurements', () => {
    test('returns paginated list', async () => {
      Measurement.findAndCountAll.mockResolvedValue({
        count: 10,
        rows: [{ id: 1, weight_kg: 80, toJSON: () => ({ id: 1, weight_kg: 80 }) }]
      });

      const req = { user: { id: 1 }, query: { page: 1, per_page: 20 } };
      const res = createRes();

      await getMeasurements(req, res);

      expect(Measurement.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: 1 }, limit: 20, offset: 0 })
      );
      expect(res.json).toHaveBeenCalledWith({
        data: expect.any(Array),
        meta: { current_page: 1, per_page: 20, total: 10, last_page: 1 }
      });
    });

    test('returns 500 on database error', async () => {
      Measurement.findAndCountAll.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, query: {} };
      const res = createRes();

      await getMeasurements(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('createMeasurement', () => {
    test('binds user_id and returns 201', async () => {
      const mockMeasurement = { id: 2, weight_kg: 81, toJSON: () => ({ id: 2, weight_kg: 81 }) };
      Measurement.create.mockResolvedValue(mockMeasurement);

      const req = {
        user: { id: 1 },
        body: { weight_kg: 81 }
      };
      const res = createRes();

      await createMeasurement(req, res);

      expect(Measurement.create).toHaveBeenCalledWith({ weight_kg: 81, user_id: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: expect.any(Object) });
    });

    test('returns 500 on database error', async () => {
      Measurement.create.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 }, body: { weight_kg: 80 } };
      const res = createRes();

      await createMeasurement(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('updateMeasurement', () => {
    test('returns 404 for non-existent record', async () => {
      Measurement.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: 99 }, body: {} };
      const res = createRes();

      await updateMeasurement(req, res);

      expect(Measurement.findOne).toHaveBeenCalledWith({ where: { id: 99, user_id: 1 } });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Measurement not found' });
    });

    test('updates record for owner', async () => {
      const mockMeasurement = { id: 10, update: jest.fn().mockResolvedValue(), toJSON: () => ({ id: 10 }) };
      Measurement.findOne.mockResolvedValue(mockMeasurement);

      const req = { user: { id: 1 }, params: { id: 10 }, body: { weight_kg: 82 } };
      const res = createRes();

      await updateMeasurement(req, res);

      expect(mockMeasurement.update).toHaveBeenCalledWith({ weight_kg: 82 });
      expect(res.json).toHaveBeenCalledWith({ data: expect.any(Object) });
    });
  });

  describe('deleteMeasurement', () => {
    test('destroys and returns 204', async () => {
      const mockMeasurement = { id: 10, destroy: jest.fn().mockResolvedValue() };
      Measurement.findOne.mockResolvedValue(mockMeasurement);

      const req = { user: { id: 1 }, params: { id: 10 } };
      const res = createRes();

      await deleteMeasurement(req, res);

      expect(Measurement.findOne).toHaveBeenCalledWith({ where: { id: 10, user_id: 1 } });
      expect(mockMeasurement.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
