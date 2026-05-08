// Baseline contract tests for Auth — unauthenticated response consistency.
const request = require('supertest');
const app = require('../../../index');

describe('Auth baseline contracts', () => {

  test('GET /api/user without auth returns 401 unauthenticated payload', async () => {
    // Contract: protected "current user" endpoint must reject unauthenticated requests.
    const res = await request(app).get('/api/user');

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Unauthenticated.' });
  });
});


