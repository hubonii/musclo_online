// Auth endpoints (registration, login, logout, current user, CSRF cookie).
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, getCsrfCookie, forgotPassword, resetPassword, verifyEmail, resendVerification, changePassword } = require('../controllers/authController');
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
router.post('/resend-verification', protect, resendVerification);
router.post('/change-password', protect, changePassword);

const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  (req, res) => {
    // Generate JWT for the authenticated Google user
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Safety check: Ensure frontendUrl starts with http/https to prevent relative redirect issues
    if (frontendUrl && !frontendUrl.startsWith('http')) {
      frontendUrl = `https://${frontendUrl}`;
    }
    
    // Set cookie for browser-based auth
    res.cookie('token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true, // Force secure in production
      sameSite: 'none', // Required for cross-site cookies
    });

    // Redirect to frontend dashboard with token in URL (as a fallback)
    // res.redirect(`${frontendUrl}/dashboard?token=${token}`);
    
    // Redirect the popup to the frontend bridge page
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

router.get('/auth/google/failure', (req, res) => {
  let frontendUrl = process.env.FRONTEND_URL || 'https://musclo.tech';
  if (frontendUrl && !frontendUrl.startsWith('http')) {
    frontendUrl = `https://${frontendUrl}`;
  }
  res.redirect(`${frontendUrl}/auth/callback?error=true`);
});

module.exports = router;
