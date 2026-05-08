
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const mailService = require('../services/mailService');
const crypto = require('crypto');
const { Op } = require('sequelize');

/**
 * Signs a JWT with the user's ID and a 30-day expiration.
 * @param {string|number} id - The user ID to encode.
 * @returns {string} The signed JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Sends a standard auth response with a 30-day secure token cookie.
 * @param {object} user - The Sequelize user instance.
 * @param {number} statusCode - HTTP status code for the response.
 * @param {object} res - Express response object.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
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
          avatar_url: user.avatar_url,
          bio: user.bio,
          google_id: user.google_id,
          created_at: user.created_at,
          email_verified_at: user.email_verified_at,
        }
      }
    });
};

/**
 * Registers a new user account and returns an auth payload.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @throws {Error} 500 if database creation fails.
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

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
      verification_code: null
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Authenticates user credentials and issues a session token.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

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

/**
 * Clears the auth token cookie from the client.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).json({
    message: 'Logged out',
  });
};

/**
 * Returns the current authenticated user's profile.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getMe = async (req, res) => {
  res.status(200).json({
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar_url: req.user.avatar_url,
      bio: req.user.bio,
      google_id: req.user.google_id,
      created_at: req.user.created_at,
      email_verified_at: req.user.email_verified_at,
    }
  });
};

/**
 * Validates a 6-digit email verification code.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ message: 'Verification code is required.' });
    }

    const user = await User.findOne({ where: { id: req.user.id } });

    if (!user.verification_code || user.verification_code !== code) {
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

/**
 * Generates and sends a new 6-digit email verification code.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.email_verified_at) {
      return res.status(200).json({ message: 'Email is already verified.', alreadyVerified: true });
    }


    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verification_code = verificationCode;
    await user.save();

    console.log(`[AUTH] Sending verification to ${user.email}: ${verificationCode}`);
    const mailSent = await mailService.sendVerificationCode(user.email, verificationCode);

    if (!mailSent) {
        return res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }

    res.status(200).json({ message: 'Verification code sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Generates and sends a password reset code to the provided email.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({ message: 'If an account exists with this email, a reset code has been sent.' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.reset_code = resetCode;
    user.reset_code_expires_at = new Date(Date.now() + 3600000);
    await user.save();

    console.log(`[AUTH] Password reset requested for ${email}. Reset code: ${resetCode}`);
    mailService.sendResetCode(email, resetCode).catch(err => {
      console.error(`[MAIL ERROR] Failed to send reset code to ${email}:`, err);
    });

    res.status(200).json({ message: 'Reset code sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Resets a user's password using a valid reset code.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  try {
    const user = await User.findOne({ 
      where: { 
        email, 
        reset_code: code,
        reset_code_expires_at: { [Op.gt]: new Date() }
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

/**
 * Updates the password for an authenticated user.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
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


