// Unit tests for WorkoutLogRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('WorkoutLogRoutes', () => {
  test('POST /api/workouts without auth returns 401', async () => {
    const res = await request(app).post('/api/workouts').send({});
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/workouts/history without auth returns 401', async () => {
    const res = await request(app).get('/api/workouts/history');
    expect(res.statusCode).toBe(401);
  });
});
