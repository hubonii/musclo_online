// Baseline contract tests for Auth — CSRF and unauthenticated response consistency.
const request = require('supertest');
const app = require('../../../index');

describe('Auth baseline contracts', () => {
  test('GET /sanctum/csrf-cookie returns 204 and sets XSRF cookie', async () => {
    // Contract: frontend can always fetch a CSRF cookie before auth actions.
    const res = await request(app).get('/sanctum/csrf-cookie');

    expect(res.statusCode).toBe(204);
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c) => c.includes('XSRF-TOKEN='))).toBe(true);
  });

  test('GET /api/user without auth returns 401 unauthenticated payload', async () => {
    // Contract: protected "current user" endpoint must reject unauthenticated requests.
    const res = await request(app).get('/api/user');

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Unauthenticated.' });
  });
});


