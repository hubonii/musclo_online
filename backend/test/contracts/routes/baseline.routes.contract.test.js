const request = require('supertest');
const app = require('../../../index');

describe('Baseline route contracts', () => {
  test('GET / returns health payload', async () => {
    // Contract: root endpoint returns health payload for uptime checks.
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Musclo API (Node.js) is running' });
  });

  test('GET /api/sanctum/csrf-cookie returns 204', async () => {
    // Contract: API-prefixed CSRF endpoint stays compatible with frontend clients.
    const res = await request(app).get('/api/sanctum/csrf-cookie');

    expect(res.statusCode).toBe(204);
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c) => c.includes('XSRF-TOKEN='))).toBe(true);
  });
});


