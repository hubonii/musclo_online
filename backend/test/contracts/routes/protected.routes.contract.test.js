const request = require('supertest');
const app = require('../../../index');

// Routes that should always require authentication.
const protectedRouteCases = [
  ['GET', '/api/settings'],
  ['GET', '/api/programs'],
  ['GET', '/api/routines/today'],
  ['GET', '/api/workouts/history'],
  ['GET', '/api/profile/me'],
  ['GET', '/api/measurements'],
  ['GET', '/api/progress-photos'],
  ['GET', '/api/analytics/stats'],
  ['GET', '/api/chat/sessions'],
  ['GET', '/api/export/csv'],
];

describe('Protected route contracts', () => {
  test.each(protectedRouteCases)('%s %s without auth returns 401', async (method, path) => {
    // Contract: no token/cookie means no access.
    const res = await request(app)[method.toLowerCase()](path);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Unauthenticated.' });
  });
});


