// Unit tests for SettingsRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('SettingsRoutes', () => {
  test('GET /api/settings without auth returns 401', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/settings without auth returns 401', async () => {
    const res = await request(app).post('/api/settings').send({ theme: 'dark' });
    expect(res.statusCode).toBe(401);
  });
});
