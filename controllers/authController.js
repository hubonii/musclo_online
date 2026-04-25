// Auth controller endpoints for register, login, logout, and current-user payload.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT helper that signs user id payload with 30-day expiry.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Standard auth response shape + httpOnly token cookie.
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        }
      }
    });
};

// Registration endpoint: validates uniqueness, hashes password, creates user row.
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Reject incomplete registration payloads before hitting the database.
  if (!name || !email || !password) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: {
        ...(name ? {} : { name: ['Name is required.'] }),
        ...(email ? {} : { email: ['Email is required.'] }),
        ...(password ? {} : { password: ['Password is required.'] }),
      }
    });
  }

  try {
    // Reject duplicate emails before doing password hashing work.
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(422).json({
        message: 'The email has already been taken.',
        errors: { email: ['The email has already been taken.'] }
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Sign in with email/password.
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    // Returns one shared auth error message for invalid email/password combinations.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: 'The provided credentials are incorrect.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove token cookie from the browser.
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    message: 'Logged out',
  });
};

// Current-user endpoint that serializes `req.user` fields.
exports.getMe = async (req, res) => {
  res.status(200).json({
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      created_at: req.user.created_at,
    }
  });
};

// Laravel Sanctum-compatible CSRF cookie endpoint for the frontend.
exports.getCsrfCookie = (req, res) => {
  res.cookie('XSRF-TOKEN', 'dummy-token', {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: false,
  });
  res.status(204).send();
};
