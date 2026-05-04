// Unit tests for AuthRoutes — router contract and authentication guards.
const request = require('supertest');
const app = require('../../../index');

jest.mock('../../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  }
}));

describe('AuthRoutes', () => {
  test('returns 401 when login has empty body', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.statusCode).toBe(401);
  });

  test('returns validation error for register with duplicate email', async () => {
    // Make findOne return a user to trigger the 422 duplicate email branch
    const { User } = require('../../../models');
    User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

    const res = await request(app).post('/api/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(res.statusCode).toBe(422);
    expect(res.body.errors.email).toBeDefined();
  });
});
