const passport = require('../../../config/passport');
const { User } = require('../../../models');
const bcrypt = require('bcryptjs');

// --- Module Mocks ---
jest.mock('passport-google-oauth20', () => ({
  Strategy: jest.fn().mockImplementation((options, verify) => ({
    _verify: verify,
    name: 'google'
  }))
}));

jest.mock('../../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('Passport Config (Google OAuth)', () => {
  let googleStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Extract the strategy callback
    googleStrategy = passport._strategies.google._verify;
  });

  test('callback generates unique username and creates user if not found', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com', username: 'john' });

    const profile = {
      id: 'google-123',
      displayName: 'John Doe',
      emails: [{ value: 'john@example.com' }],
      photos: [{ value: 'photo.jpg' }]
    };

    const done = jest.fn();
    await googleStrategy('access', 'refresh', profile, done);

    // Verify username generation logic
    expect(User.findOne).toHaveBeenCalledWith({ where: { google_id: 'google-123' } });
    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
    
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      username: expect.stringMatching(/^john/),
      google_id: 'google-123'
    }));
    expect(done).toHaveBeenCalledWith(null, expect.any(Object));
  });

  test('callback retries username generation on collision', async () => {
    // 1st check: google_id (null)
    // 2nd check: email (null)
    // 3rd check: username 'john' (exists)
    // 4th check: username 'johnXXXX' (null)
    User.findOne
      .mockResolvedValueOnce(null) // google_id
      .mockResolvedValueOnce(null) // email
      .mockResolvedValueOnce({ id: 99, username: 'john' }) // username collision
      .mockResolvedValueOnce(null); // second attempt success

    User.create.mockResolvedValue({ id: 100, username: 'john5678' });

    const profile = {
      id: 'google-123',
      displayName: 'John',
      emails: [{ value: 'john@example.com' }]
    };

    const done = jest.fn();
    await googleStrategy('access', 'refresh', profile, done);

    expect(User.findOne).toHaveBeenCalledTimes(4);
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      username: expect.stringMatching(/^john\d+$/)
    }));
  });

  test('callback links to existing email account if found', async () => {
    const existingUser = {
      id: 5,
      email: 'john@example.com',
      save: jest.fn().mockResolvedValue(true)
    };
    User.findOne
      .mockResolvedValueOnce(null) // google_id
      .mockResolvedValueOnce(existingUser); // found by email

    const profile = {
      id: 'google-123',
      displayName: 'John',
      emails: [{ value: 'john@example.com' }]
    };

    const done = jest.fn();
    await googleStrategy('access', 'refresh', profile, done);

    expect(existingUser.google_id).toBe('google-123');
    expect(existingUser.save).toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith(null, existingUser);
  });
});
