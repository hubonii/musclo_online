// Unit tests for ProgressPhotoRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('ProgressPhotoRoutes', () => {
  test('GET /api/progress-photos without auth returns 401', async () => {
    const res = await request(app).get('/api/progress-photos');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/progress-photos without auth returns 401', async () => {
    const res = await request(app).post('/api/progress-photos');
    expect(res.statusCode).toBe(401);
  });
});
