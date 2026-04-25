// Auth endpoints (registration, login, logout, current user, CSRF cookie).
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, getCsrfCookie, forgotPassword, resetPassword, verifyEmail, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public auth routes.
// Initializes CSRF cookie used by clients before credentialed requests.
router.get('/sanctum/csrf-cookie', getCsrfCookie);
// Creates a new user account row and returns auth payload.
router.post('/register', register);
// Authenticates credentials and issues session/JWT token.
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected auth routes.
// Invalidates current session/token for the authenticated user.
router.post('/logout', protect, logout);
// Returns authenticated user profile payload.
router.get('/user', protect, getMe);
router.post('/verify-email', protect, verifyEmail);
router.post('/change-password', protect, changePassword);

const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT for the authenticated Google user
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Set cookie for browser-based auth
    res.cookie('token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    // Redirect to frontend dashboard with token in URL (as a fallback)
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  }
);

module.exports = router;
