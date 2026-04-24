// Unit tests for RoutineRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('RoutineRoutes', () => {
  test('GET /api/routines/today without auth returns 401', async () => {
    const res = await request(app).get('/api/routines/today');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/routines/invalid/action (protected) returns 401', async () => {
    const res = await request(app).post('/api/routines/invalid/action');
    expect(res.statusCode).toBe(401);
  });
});
