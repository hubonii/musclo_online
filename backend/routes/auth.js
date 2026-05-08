/**
 * Routes for authentication and user session management.
 */
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, getCsrfCookie, forgotPassword, resetPassword, verifyEmail, resendVerification, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');



router.post('/register', register);

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);



router.post('/logout', protect, logout);

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

    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Safety check: Ensure frontendUrl starts with http/https to prevent relative redirect issues
    if (frontendUrl && !frontendUrl.startsWith('http')) {
      frontendUrl = `https://${frontendUrl}`;
    }
    

    res.cookie('token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });


    

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
