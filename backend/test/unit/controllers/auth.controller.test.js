const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');
const {
  register,
  login,
  logout,
  getMe,
} = require('../../../controllers/authController');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  Op: {
    or: Symbol('or'),
    gt: Symbol('gt')
  }
}));

describe('AuthController', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
    jwt.sign.mockReturnValue('signed-token');
  });

  describe('register', () => {
    test('returns 422 when email already exists', async () => {
      User.findOne.mockResolvedValue({ id: 9, email: 'taken@example.com' });

      const req = {
        body: { name: 'Taken', email: 'taken@example.com', password: 'pw123456' },
      };
      const res = createRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'The email has already been taken.'
      }));
    });

    test('returns 422 when username already exists', async () => {
      // First call (email check) returns null, second call (username check) returns user
      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 10, username: 'taken' });

      const req = {
        body: { name: 'N', email: 'e@e.com', username: 'taken', password: 'P' },
      };
      const res = createRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'The username has already been taken.'
      }));
    });

    test('creates user with username and returns auth payload', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed-password');
      User.create.mockResolvedValue({
        id: 3,
        name: 'New User',
        username: 'newuser',
        email: 'new@example.com'
      });

      const req = {
        body: { name: 'New User', email: 'new@example.com', username: 'newuser', password: 'pw123456' },
      };
      const res = createRes();

      await register(req, res);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        username: 'newuser',
        email: 'new@example.com',
        password: 'hashed-password'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          token: 'signed-token',
          user: expect.objectContaining({ username: 'newuser' })
        })
      });
    });
  });

  describe('login', () => {
    test('authenticates via email identifier', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'user@example.com', password: 'hashed' });
      bcrypt.compare.mockResolvedValue(true);

      const req = { body: { identifier: 'user@example.com', password: 'password' } };
      const res = createRes();

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.any(Object)
      }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('authenticates via username identifier', async () => {
      User.findOne.mockResolvedValue({ id: 1, username: 'myuser', password: 'hashed' });
      bcrypt.compare.mockResolvedValue(true);

      const req = { body: { identifier: 'myuser', password: 'password' } };
      const res = createRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: expect.objectContaining({ username: 'myuser' })
        })
      });
    });

    test('rejects incorrect credentials', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'user@example.com', password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      const req = { body: { identifier: 'user@example.com', password: 'wrong' } };
      const res = createRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  test('logout clears auth cookie', () => {
    const req = {};
    const res = createRes();

    logout(req, res);

    expect(res.cookie).toHaveBeenCalledWith('token', 'none', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getMe returns user data', async () => {
    const req = {
      user: { id: 88, name: 'Auth User', email: 'auth@example.com', username: 'authuser' }
    };
    const res = createRes();

    await getMe(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 88, username: 'authuser' })
    });
  });
});
