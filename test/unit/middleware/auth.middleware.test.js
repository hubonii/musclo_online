// Unit tests for AuthMiddleware — JWT verification and session guarding.
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');
const { protect } = require('../../../middleware/auth');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn(),
  },
}));



describe('Auth Middleware', () => {
  beforeEach(() => {
    // Middleware verifies JWT using this secret.
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  test('returns 401 when no token is provided', async () => {
    const req = { headers: {}, cookies: {} };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthenticated.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts bearer token and calls next with attached user', async () => {
    // Simulate a valid token decode followed by successful user lookup.
    jwt.verify.mockReturnValue({ id: 42 });
    User.findByPk.mockResolvedValue({ id: 42, name: 'Token User' });

    const req = {
      headers: { authorization: 'Bearer valid-token' },
      cookies: {},
    };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(User.findByPk).toHaveBeenCalledWith(42);
    expect(req.user).toEqual({ id: 42, name: 'Token User' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('returns 401 when token verification fails', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('bad token');
    });

    const req = {
      headers: { authorization: 'Bearer bad-token' },
      cookies: {},
    };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthenticated.' });
    expect(next).not.toHaveBeenCalled();
  });
});


