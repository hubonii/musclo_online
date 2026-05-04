// Unit tests for ExerciseRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('ExerciseRoutes', () => {
  test('GET /api/exercises without auth returns 401', async () => {
    const res = await request(app).get('/api/exercises');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/exercises/non/existent/path (protected) returns 401', async () => {
    const res = await request(app).get('/api/exercises/non/existent/path');
    expect(res.statusCode).toBe(401);
  });
});
