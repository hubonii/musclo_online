
/**
 * Authentication middleware for protecting routes and verifying email status.
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to protect routes by validating JWT tokens.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const protect = async (req, res, next) => {
  let token;


  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  else if (req.cookies && req.cookies.token && req.cookies.token !== 'none') {
    token = req.cookies.token;
  }


  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated.' });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthenticated.' });
  }
};

/**
 * Middleware to ensure the authenticated user has a verified email.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const verified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthenticated.' });
  }

  if (!req.user.email_verified_at) {
    return res.status(403).json({ 
      message: 'Your email address is not verified.',
      needs_verification: true 
    });
  }

  next();
};

module.exports = { protect, verified };
