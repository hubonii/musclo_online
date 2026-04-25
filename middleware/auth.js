// Auth guard: read JWT from cookie or Bearer header, then attach the user.
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  // Accept JWT from API clients that send `Authorization: Bearer <token>`.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback to cookie-based auth flow (ignore 'none' logout tombstone).
  else if (req.cookies && req.cookies.token && req.cookies.token !== 'none') {
    token = req.cookies.token;
  }

  // Block request immediately when token is missing.
  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated.' });
  }

  try {
    // Validate token signature and extract payload fields.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Loads authenticated user row and assigns `req.user`.
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthenticated.' });
  }
};

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
