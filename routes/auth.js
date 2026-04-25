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
    
    // Modern approach: Communicate with the opener window and close popup
    res.send(`
      <html>
        <head><title>Authenticating...</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 16px; text-align: center; padding: 20px;">
          <script>
            function sendToOpener() {
              if (window.opener) {
                console.log('Sending token to opener...');
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token: "${token}" }, "*");
                // Close after a short delay to ensure message is sent
                setTimeout(() => window.close(), 500);
              } else {
                console.error('Opener not found');
                document.getElementById('status').innerHTML = '<div style="color: #ef4444; font-weight: bold;">Connection Lost</div><p>We lost connection to the main window. Please close this and try again from Musclo.tech.</p>';
              }
            }
            window.onload = sendToOpener;
          </script>
          <div id="status">
            <div style="color: #EA580C; font-weight: bold; font-size: 18px;">Authenticating...</div>
            <p style="color: #64748b; font-size: 14px;">Synchronizing your session. This window will close automatically.</p>
          </div>
        </body>
      </html>
    `);
  }
);

router.get('/auth/google/failure', (req, res) => {
  res.send(`
    <html>
      <body>
        <script>
          window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE' }, "*");
          window.close();
        </script>
      </body>
    </html>
  `);
});

module.exports = router;
