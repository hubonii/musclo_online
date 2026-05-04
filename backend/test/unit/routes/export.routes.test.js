// Unit tests for ExportRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('ExportRoutes', () => {
  test('GET /api/export/csv without auth returns 401', async () => {
    const res = await request(app).get('/api/export/csv');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/export/invalid (protected) returns 401', async () => {
    const res = await request(app).get('/api/export/invalid');
    expect(res.statusCode).toBe(401);
  });
});
