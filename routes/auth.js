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

module.exports = router;
