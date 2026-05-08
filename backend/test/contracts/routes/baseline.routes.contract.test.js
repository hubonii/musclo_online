const request = require('supertest');
const app = require('../../../index');

describe('Baseline route contracts', () => {
  test('GET / returns health payload', async () => {
    // Contract: root endpoint returns health payload for uptime checks.
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Musclo API (Node.js) is running' });
  });


});


