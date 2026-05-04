// Profile endpoints for account data, achievements, and routine summaries.
const express = require('express');
const router = express.Router();
const { 
    getProfile, updateProfile, updateAvatar, 
    getAchievements, getUserRoutines,
    requestEmailChange, verifyEmailChange, deleteAccount 
} = require('../controllers/profileController');
const { protect, verified } = require('../middleware/auth');

// Requires auth even when reading another user's public profile subset.
router.use(protect);

// 1. Specific Account Actions (Must come before wildcards)
router.get('/me', getProfile);
router.put('/', updateProfile);
router.delete('/delete', deleteAccount);

// Email Change & Account Management
router.post('/request-email-change', requestEmailChange);
router.post('/verify-email-change', verifyEmailChange);

const upload = require('../middleware/upload');
router.post('/avatar', upload.single('avatar'), updateAvatar);

// 2. Wildcard User Routes
// `:userId` can be owner id or another user id (privacy checks happen in controller).
router.get('/:userId', verified, getProfile);

// Returns full achievement catalog with unlocked state for target user.
router.get('/:userId/achievements', verified, getAchievements);
// Inline import keeps route connected to controller export without extra destructuring.
router.get('/:userId/routines', verified, getUserRoutines);

module.exports = router;


