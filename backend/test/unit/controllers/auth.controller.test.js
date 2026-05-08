
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');
const {
  register,
  login,
  logout,
  getMe,
  getCsrfCookie,
} = require('../../../controllers/authController');
const { createRes } = require('../../helpers/express');


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
  },
}));

describe('AuthController', () => {
  beforeEach(() => {

    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
    jwt.sign.mockReturnValue('signed-token');
  });

  test('register returns 422 when email already exists', async () => {
    User.findOne.mockResolvedValue({ id: 9, email: 'taken@example.com' });

    const req = {
      body: { name: 'Taken', email: 'taken@example.com', password: 'pw123456' },
    };
    const res = createRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message: 'The email has already been taken.',
      errors: { email: ['The email has already been taken.'] },
    });
  });

  test('register creates user and returns auth payload with cookie', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed-password');


    const createdUser = {
      id: 3,
      name: 'New User',
      email: 'new@example.com',
      created_at: '2026-04-13T00:00:00.000Z',
    };
    User.create.mockResolvedValue(createdUser);

    const req = {
      body: { name: 'New User', email: 'new@example.com', password: 'pw123456' },
    };
    const res = createRes();

    await register(req, res);

    expect(User.create).toHaveBeenCalledWith({
      name: 'New User',
      email: 'new@example.com',
      password: 'hashed-password',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalledWith(
      'token',
      'signed-token',
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.json).toHaveBeenCalledWith({
      data: {
        user: {
          id: 3,
          name: 'New User',
          email: 'new@example.com',
          created_at: '2026-04-13T00:00:00.000Z',
        },
      },
    });
  });

  test('register returns 500 on database error', async () => {
    User.findOne.mockRejectedValue(new Error('DB Error'));
    const req = { body: { name: 'N', email: 'e@e.com', password: 'P' } };
    const res = createRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
  });

  test('login rejects incorrect credentials', async () => {

    User.findOne.mockResolvedValue({ id: 1, email: 'user@example.com', password: 'hashed' });
    bcrypt.compare.mockResolvedValue(false);

    const req = { body: { email: 'user@example.com', password: 'wrong' } };
    const res = createRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'The provided credentials are incorrect.',
    });
  });

  test('login returns 500 on database error', async () => {
    User.findOne.mockRejectedValue(new Error('DB Error'));
    const req = { body: { email: 'e@e.com', password: 'P' } };
    const res = createRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
  });

  test('logout clears auth cookie and returns confirmation', () => {
    const req = {};
    const res = createRes();

    logout(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      'token',
      'none',
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
  });

  test('getMe returns authenticated user payload', async () => {
    const req = {
      user: {
        id: 88,
        name: 'Auth User',
        email: 'auth@example.com',
        created_at: '2026-04-13T00:00:00.000Z',
      },
    };
    const res = createRes();

    await getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        id: 88,
        name: 'Auth User',
        email: 'auth@example.com',
        created_at: '2026-04-13T00:00:00.000Z',
      },
    });
  });

  test('getCsrfCookie responds 204 and sets XSRF cookie', () => {
    const req = {};
    const res = createRes();

    getCsrfCookie(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      'XSRF-TOKEN',
      'dummy-token',
      expect.objectContaining({ httpOnly: false })
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});


