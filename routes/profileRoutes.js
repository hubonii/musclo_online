// Profile endpoints for account data, achievements, and routine summaries.
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAchievements } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// Requires auth even when reading another user's public profile subset.
router.use(protect);

// Current user's profile shortcut.
router.get('/me', getProfile);

// Read profile/achievements/routines by user id.
// `:userId` can be owner id or another user id (privacy checks happen in controller).
router.get('/:userId', getProfile);
const upload = require('../middleware/upload');

// Updates authenticated user's editable profile fields.
router.put('/', updateProfile);
// Avatar upload endpoint
router.post('/avatar', upload.single('avatar'), require('../controllers/profileController').updateAvatar);
// Returns full achievement catalog with unlocked state for target user.
router.get('/:userId/achievements', getAchievements);
// Inline import keeps route connected to controller export without extra destructuring.
router.get('/:userId/routines', require('../controllers/profileController').getUserRoutines);

module.exports = router;


