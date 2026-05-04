// Unit tests for ProfileRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('ProfileRoutes', () => {
  test('GET /api/profile/me without auth returns 401', async () => {
    const res = await request(app).get('/api/profile/me');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/profile/achievements without auth returns 401', async () => {
    const res = await request(app).get('/api/profile/achievements');
    expect(res.statusCode).toBe(401);
  });
});
