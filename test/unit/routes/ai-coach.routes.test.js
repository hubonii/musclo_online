// Unit tests for AiCoachRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

describe('AiCoachRoutes', () => {
  test('GET /api/chat/sessions without auth returns 401', async () => {
    const res = await request(app).get('/api/chat/sessions');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/chat/ask without auth returns 401', async () => {
    const res = await request(app).post('/api/chat/ask').send({ message: 'hi' });
    expect(res.statusCode).toBe(401);
  });
});
