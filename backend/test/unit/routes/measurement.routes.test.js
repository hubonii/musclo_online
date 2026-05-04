// Unit tests for MeasurementRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('MeasurementRoutes', () => {
  test('GET /api/measurements without auth returns 401', async () => {
    const res = await request(app).get('/api/measurements');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/measurements without auth returns 401', async () => {
    const res = await request(app).post('/api/measurements').send({ weight_kg: 80 });
    expect(res.statusCode).toBe(401);
  });
});
