// Unit tests for AnalyticsRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('AnalyticsRoutes', () => {
  test('GET /api/analytics/stats without auth returns 401', async () => {
    const res = await request(app).get('/api/analytics/stats');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/analytics/invalid (protected) returns 401', async () => {
    const res = await request(app).get('/api/analytics/invalid');
    expect(res.statusCode).toBe(401);
  });
});
