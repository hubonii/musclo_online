// Unit tests for ProgramRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('ProgramRoutes', () => {
  test('GET /api/programs without auth returns 401', async () => {
    const res = await request(app).get('/api/programs');
    expect(res.statusCode).toBe(401);
  });

  test('DELETE /api/programs/none returns 401 without token', async () => {
    const res = await request(app).delete('/api/programs/none');
    expect(res.statusCode).toBe(401);
  });
});
