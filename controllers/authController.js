// Auth controller endpoints for register, login, logout, and current-user payload.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const mailService = require('../services/mailService');
const crypto = require('crypto');

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
        token,
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

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      verification_code: verificationCode
    });

    // Send verification email in background
    mailService.sendVerificationCode(email, verificationCode);

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
// Verify email code
exports.verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ message: 'Verification code is required.' });
    }

    const user = await User.findOne({ where: { id: req.user.id } });

    if (user.verification_code !== code) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    user.email_verified_at = new Date();
    user.verification_code = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send password reset code
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists for security, just say if email is valid we sent it
      return res.status(200).json({ message: 'If an account exists with this email, a reset code has been sent.' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.reset_code = resetCode;
    user.reset_code_expires_at = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await mailService.sendResetCode(email, resetCode);

    res.status(200).json({ message: 'Reset code sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset password with code
exports.resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  try {
    const user = await User.findOne({ 
      where: { 
        email, 
        reset_code: code,
        reset_code_expires_at: { [require('sequelize').Op.gt]: new Date() }
      } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.reset_code = null;
    user.reset_code_expires_at = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password (for logged in users)
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCsrfCookie = (req, res) => {
  res.cookie('XSRF-TOKEN', 'dummy-token', {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: false,
  });
  res.status(204).send();
};
