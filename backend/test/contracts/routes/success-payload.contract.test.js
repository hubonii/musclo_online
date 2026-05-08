const request = require('supertest');
const app = require('../../../index');

describe('Successful baseline payload contracts', () => {
  test('GET / returns expected health payload shape', async () => {
    // Verifies response value and exact payload field shape.
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Musclo API (Node.js) is running' });
    expect(Object.keys(res.body)).toEqual(['message']);
    expect(typeof res.body.message).toBe('string');
    expect(res.body.message.length).toBeGreaterThan(0);
  });


});


